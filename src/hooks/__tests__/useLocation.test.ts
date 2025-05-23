import { renderHook, act } from '@testing-library/react-native';
import { useLocation } from '../useLocation';
import * as Location from 'expo-location';

jest.mock('expo-location');

describe('useLocation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle permission denied', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'denied',
    });

    const { result } = renderHook(() => useLocation());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.errorMsg).toBe('Permission to access location was denied');
    expect(result.current.loading).toBe(false);
    expect(result.current.location).toBeNull();
  });

  it('should handle successful location fetch', async () => {
    const mockLocation = {
      coords: {
        latitude: 37.7749,
        longitude: -122.4194,
      },
    };

    const mockAddress = {
      street: 'Market St',
      city: 'San Francisco',
      country: 'USA',
    };

    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });

    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(mockLocation);
    (Location.reverseGeocodeAsync as jest.Mock).mockResolvedValue([mockAddress]);

    const { result } = renderHook(() => useLocation());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.errorMsg).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.location).toEqual({
      latitude: 37.7749,
      longitude: -122.4194,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
      address: 'Market St, San Francisco, USA',
    });
  });
}); 