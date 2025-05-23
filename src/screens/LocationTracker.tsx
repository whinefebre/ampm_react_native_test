import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Text, Alert, TouchableOpacity, Platform, Linking, TextInput, ActivityIndicator, FlatList, AccessibilityInfo, Appearance } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LocationData, GeocodeResult, ReverseGeocodeResult, INITIAL_REGION } from '../types/location';

export default function LocationTracker() {
  const [location, setLocation] = useState<LocationData | null>(INITIAL_REGION);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<GeocodeResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef<MapView>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setIsLoading(prev => !prev);
    });

    return () => subscription.remove();
  }, []);

  const announceForAccessibility = (message: string) => {
    AccessibilityInfo.announceForAccessibility(message);
  };

  const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Geocoding request timed out')), 5000);
      });

      const geocodePromise = Location.reverseGeocodeAsync({
        latitude,
        longitude
      });

      const response = await Promise.race([geocodePromise, timeoutPromise]) as ReverseGeocodeResult[];
      
      if (response && response[0]) {
        const address = response[0];
        const formattedAddress = [
          address.street,
          address.city,
          address.region,
          address.country
        ].filter(Boolean).join(', ');
        
        announceForAccessibility(`Location found: ${formattedAddress}`);
        return formattedAddress;
      }
      return null;
    } catch (error) {
      console.error('Error getting address:', error);
      if (error instanceof Error && error.message === 'Geocoding request timed out') {
        setErrorMsg('Address lookup timed out. Please try again.');
        announceForAccessibility('Address lookup timed out. Please try again.');
      }
      return null;
    }
  };

  const searchLocation = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setErrorMsg(null);
    announceForAccessibility('Searching for location...');

    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Search request timed out')), 5000);
      });

      const searchPromise = Location.geocodeAsync(searchQuery);
      const results = await Promise.race([searchPromise, timeoutPromise]) as GeocodeResult[];

      if (results && results.length > 0) {
        const limitedResults = results.slice(0, 5);
        setSearchResults(limitedResults);
        setShowResults(true);
        announceForAccessibility(`Found ${limitedResults.length} locations`);
      } else {
        setErrorMsg('Location not found');
        announceForAccessibility('Location not found');
        setSearchResults([]);
        setShowResults(false);
      }
    } catch (error) {
      console.error('Search error:', error);
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (error instanceof Error) {
        if (error.message === 'Search request timed out') {
          errorMessage = 'Search request timed out. Please try again.';
        } else {
          errorMessage = 'Error searching for location. Please check your internet connection and try again.';
        }
      }
      
      setErrorMsg(errorMessage);
      announceForAccessibility(errorMessage);
      setSearchResults([]);
      setShowResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLocationSelect = (result: GeocodeResult) => {
    const address = [
      result.name,
      result.street,
      result.city,
      result.region,
      result.country
    ].filter(Boolean).join(', ');

    const newLocation = {
      latitude: result.latitude,
      longitude: result.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
      address: address || searchQuery
    };
    setLocation(newLocation);
    mapRef.current?.animateToRegion(newLocation, 1000);
    setShowResults(false);
    setSearchQuery(address || searchQuery);
    announceForAccessibility(`Selected location: ${address || searchQuery}`);
  };

  const renderSearchResult = ({ item }: { item: GeocodeResult }) => {
    const address = [
      item.name,
      item.street,
      item.city,
      item.region,
      item.country
    ].filter(Boolean).join(', ');

    return (
      <TouchableOpacity
        style={[styles.searchResultItem, isDark && styles.darkSearchResultItem]}
        onPress={() => handleLocationSelect(item)}
        accessibilityLabel={`Location: ${address || 'Unknown location'}`}
        accessibilityHint="Double tap to select this location"
      >
        <Ionicons name="location" size={20} color={isDark ? '#fff' : '#000'} style={styles.searchResultIcon} />
        <Text style={[styles.searchResultText, isDark && styles.darkSearchResultText]} numberOfLines={2}>
          {address || 'Unknown location'}
        </Text>
      </TouchableOpacity>
    );
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        announceForAccessibility('Permission to access location was denied');
        Alert.alert(
          'Permission Denied',
          'Location permission is required to use this app.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Open Settings',
              onPress: () => Linking.openSettings()
            }
          ]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Permission error:', error);
      setErrorMsg('Error requesting location permission');
      announceForAccessibility('Error requesting location permission');
      return false;
    }
  };

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);
      announceForAccessibility('Getting current location...');

      const hasPermission = await requestLocationPermission();
      if (!hasPermission) return;

      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        setErrorMsg('Location services are disabled');
        announceForAccessibility('Location services are disabled');
        Alert.alert(
          'Location Services Disabled',
          'Please enable location services in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Open Settings',
              onPress: () => Linking.openSettings()
            }
          ]
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 5000,
      });

      if (location && location.coords) {
        const address = await getAddressFromCoordinates(
          location.coords.latitude,
          location.coords.longitude
        );

        const newLocation: LocationData = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
          address: address || undefined
        };
        setLocation(newLocation);
        mapRef.current?.animateToRegion(newLocation, 1000);
        announceForAccessibility(`Current location found: ${address || 'Coordinates only'}`);
      } else {
        setErrorMsg('Invalid location data received');
        announceForAccessibility('Invalid location data received');
      }
    } catch (error) {
      console.error('Location error:', error);
      const errorMessage = `Error getting location: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setErrorMsg(errorMessage);
      announceForAccessibility(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const handleMyLocationPress = () => {
    getCurrentLocation();
  };

  return (
    <View style={[styles.container, isDark && styles.darkContainer]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'ios' ? undefined : PROVIDER_GOOGLE}
        initialRegion={INITIAL_REGION}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        showsTraffic={false}
        showsBuildings={true}
        showsIndoors={true}
        mapType={isDark ? "standard" : "standard"}
        moveOnMarkerPress={false}
        followsUserLocation={true}
        loadingEnabled={true}
        loadingIndicatorColor={isDark ? "#ffffff" : "#666666"}
        loadingBackgroundColor={isDark ? '#000000' : '#ffffff'}
        accessibilityLabel="Map showing current location"
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="My Location"
            description={location.address || 'You are here'}
            pinColor="#007AFF"
          />
        )}
      </MapView>
      
      <View style={[styles.searchContainer, isDark && styles.darkSearchContainer]}>
        <TextInput
          style={[styles.searchInput, isDark && styles.darkSearchInput]}
          placeholder="Search for a location..."
          placeholderTextColor={isDark ? '#999' : '#666'}
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            if (!text.trim()) {
              setShowResults(false);
              setSearchResults([]);
            }
          }}
          onSubmitEditing={searchLocation}
          returnKeyType="search"
          accessibilityLabel="Search input"
          accessibilityHint="Enter a location to search"
        />
        {isSearching ? (
          <ActivityIndicator style={styles.searchIcon} color={isDark ? "#ffffff" : "#007AFF"} />
        ) : (
          <TouchableOpacity 
            onPress={searchLocation} 
            style={[styles.searchIcon, isDark && styles.darkSearchIcon]}
            accessibilityLabel="Search button"
            accessibilityHint="Double tap to search for the entered location"
          >
            <Ionicons name="search" size={24} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>
        )}
      </View>

      {showResults && searchResults.length > 0 && (
        <View 
          style={[styles.searchResultsContainer, isDark && styles.darkSearchResultsContainer]}
          accessibilityLabel={`${searchResults.length} search results`}
        >
          <FlatList
            data={searchResults}
            renderItem={renderSearchResult}
            keyExtractor={(_, index) => index.toString()}
            style={styles.searchResultsList}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}

      <View style={[styles.infoContainer, isDark && styles.darkInfoContainer]}>
        <Text style={[styles.coordinatesText, isDark && styles.darkText]}>
          {location
            ? location.address || `Latitude: ${location.latitude.toFixed(6)}\nLongitude: ${location.longitude.toFixed(6)}`
            : 'Location not available'}
        </Text>
        {errorMsg && (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, isDark && styles.darkErrorText]}>{errorMsg}</Text>
            <TouchableOpacity
              style={[styles.retryButton, isDark && styles.darkRetryButton]}
              onPress={handleMyLocationPress}
              accessibilityLabel="Retry button"
              accessibilityHint="Double tap to retry getting location"
            >
              <Text style={[styles.retryButtonText, isDark && styles.darkRetryButtonText]}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.myLocationButton, isDark && styles.darkMyLocationButton]}
        onPress={handleMyLocationPress}
        testID="my-location-button"
        accessibilityLabel="My location button"
        accessibilityHint="Double tap to center map on your current location"
      >
        <Ionicons name="locate" size={24} color={isDark ? "#000000" : "white"} />
      </TouchableOpacity>

      {isLoading && (
        <View style={[styles.loadingOverlay, isDark && styles.darkLoadingOverlay]}>
          <ActivityIndicator size="large" color={isDark ? "#ffffff" : "#007AFF"} />
          <Text style={[styles.loadingText, isDark && styles.darkLoadingText]}>
            Getting your location...
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  darkContainer: {
    backgroundColor: '#000000',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  searchContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 2,
  },
  darkSearchContainer: {
    backgroundColor: 'rgba(28, 28, 30, 0.95)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#000',
    paddingHorizontal: 12,
    fontWeight: '500',
  },
  darkSearchInput: {
    color: '#fff',
  },
  searchIcon: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
  },
  darkSearchIcon: {
    backgroundColor: '#2c2c2e',
  },
  searchResultsContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 110 : 70,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 16,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1,
  },
  darkSearchResultsContainer: {
    backgroundColor: 'rgba(28, 28, 30, 0.98)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchResultsList: {
    borderRadius: 16,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  darkSearchResultItem: {
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  searchResultIcon: {
    marginRight: 12,
  },
  searchResultText: {
    flex: 1,
    fontSize: 14,
    color: '#000',
  },
  darkSearchResultText: {
    color: '#fff',
  },
  infoContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 0,
  },
  darkInfoContainer: {
    backgroundColor: 'rgba(28, 28, 30, 0.95)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  coordinatesText: {
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
  },
  darkText: {
    color: '#fff',
  },
  errorContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  darkErrorText: {
    color: '#ff453a',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  darkRetryButton: {
    backgroundColor: '#0A84FF',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  darkRetryButtonText: {
    color: '#fff',
  },
  myLocationButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  darkMyLocationButton: {
    backgroundColor: '#ffffff',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  darkLoadingOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
  },
  darkLoadingText: {
    color: '#ffffff',
  },
}); 