import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LocationTracker from '../LocationTracker';
import * as Location from 'expo-location';

// Mock expo-location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  hasServicesEnabledAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  geocodeAsync: jest.fn(),
  reverseGeocodeAsync: jest.fn(),
}));

describe('LocationTracker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByPlaceholderText, getByTestId } = render(<LocationTracker />);
    expect(getByPlaceholderText('Search for a location...')).toBeTruthy();
    expect(getByTestId('my-location-button')).toBeTruthy();
  });

  it('requests location permission on mount', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.hasServicesEnabledAsync as jest.Mock).mockResolvedValue(true);
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
      coords: { latitude: 37.4219983, longitude: -122.084 }
    });
    (Location.reverseGeocodeAsync as jest.Mock).mockResolvedValue([{
      street: 'Test Street',
      city: 'Test City',
      region: 'Test Region',
      country: 'Test Country'
    }]);

    render(<LocationTracker />);

    await waitFor(() => {
      expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
    });
  });

  it('handles permission denial', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
    
    const { getByText } = render(<LocationTracker />);
    
    await waitFor(() => {
      expect(getByText('Permission to access location was denied')).toBeTruthy();
    });
  });

  it('handles location services disabled', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.hasServicesEnabledAsync as jest.Mock).mockResolvedValue(false);
    
    const { getByText } = render(<LocationTracker />);
    
    await waitFor(() => {
      expect(getByText('Location services are disabled')).toBeTruthy();
    });
  });

  it('searches for locations', async () => {
    const mockGeocodeResult = [{
      latitude: 37.4219983,
      longitude: -122.084,
      name: 'Test Location',
      street: 'Test Street',
      city: 'Test City',
      region: 'Test Region',
      country: 'Test Country'
    }];

    (Location.geocodeAsync as jest.Mock).mockResolvedValue(mockGeocodeResult);

    const { getByPlaceholderText, getByText } = render(<LocationTracker />);
    const searchInput = getByPlaceholderText('Search for a location...');

    fireEvent.changeText(searchInput, 'Test Location');
    fireEvent(searchInput, 'submitEditing');

    await waitFor(() => {
      expect(Location.geocodeAsync).toHaveBeenCalledWith('Test Location');
    });
  });

  it('handles search errors', async () => {
    (Location.geocodeAsync as jest.Mock).mockRejectedValue(new Error('Search failed'));

    const { getByPlaceholderText, getByText } = render(<LocationTracker />);
    const searchInput = getByPlaceholderText('Search for a location...');

    fireEvent.changeText(searchInput, 'Invalid Location');
    fireEvent(searchInput, 'submitEditing');

    await waitFor(() => {
      expect(getByText(/Error searching for location/)).toBeTruthy();
    });
  });
}); 