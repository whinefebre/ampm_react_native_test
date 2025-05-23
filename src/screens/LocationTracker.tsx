import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
  Keyboard,
  useColorScheme,
  Dimensions,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { LocationObject, LocationAccuracy } from 'expo-location';
import { LocationData } from '../types/location';

const { width, height } = Dimensions.get('window');

export default function LocationTracker() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const mapRef = useRef<MapView>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: LocationAccuracy.High,
        });

        const [address] = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        setLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address: address ? `${address.street}, ${address.city}` : null,
        });
      } catch (error) {
        setErrorMsg('Error getting location');
      }
    })();
  }, []);

  const handleMyLocationPress = async () => {
    try {
      setIsLoading(true);
      setErrorMsg(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: LocationAccuracy.High,
      });

      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: address ? `${address.street}, ${address.city}` : null,
      };

      setLocation(newLocation);
      mapRef.current?.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {
      setErrorMsg('Error getting location');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);
      setErrorMsg(null);

      const results = await Location.geocodeAsync(searchQuery);
      if (results.length > 0) {
        const searchResults = await Promise.all(
          results.map(async (result) => {
            const [address] = await Location.reverseGeocodeAsync({
              latitude: result.latitude,
              longitude: result.longitude,
            });
            return {
              latitude: result.latitude,
              longitude: result.longitude,
              address: address ? `${address.street}, ${address.city}` : null,
            };
          })
        );
        setSearchResults(searchResults);
      } else {
        setSearchResults([]);
        setErrorMsg('No locations found');
      }
    } catch (error) {
      setErrorMsg('Error searching for location');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultPress = (result: LocationData) => {
    setLocation(result);
    setSearchResults([]);
    setSearchQuery('');
    Keyboard.dismiss();
    mapRef.current?.animateToRegion({
      latitude: result.latitude,
      longitude: result.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  return (
    <View style={[styles.container, isDark && styles.darkContainer]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={
          location
            ? {
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }
            : undefined
        }
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        showsTraffic={false}
        showsBuildings={true}
        showsIndoors={true}
        showsPointsOfInterest={true}
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            title="Current Location"
            description={location.address || 'No address available'}
          />
        )}
      </MapView>

      <View style={[styles.searchContainer, isDark && styles.darkSearchContainer]}>
        <TextInput
          style={[styles.searchInput, isDark && styles.darkSearchInput]}
          placeholder="Search location..."
          placeholderTextColor={isDark ? '#999' : '#666'}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {isSearching && (
          <ActivityIndicator
            style={styles.searchIndicator}
            color={isDark ? '#fff' : '#000'}
          />
        )}
      </View>

      {searchResults.length > 0 && (
        <View style={[styles.searchResults, isDark && styles.darkSearchResults]}>
          {searchResults.map((result, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.resultItem,
                isDark && styles.darkResultItem,
                index === searchResults.length - 1 && styles.lastResultItem,
              ]}
              onPress={() => handleResultPress(result)}
            >
              <Text
                style={[styles.resultText, isDark && styles.darkResultText]}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {result.address || `Lat: ${result.latitude.toFixed(6)}, Long: ${result.longitude.toFixed(6)}`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={[styles.myLocationButton, isDark && styles.darkMyLocationButton]}
        onPress={handleMyLocationPress}
        accessibilityLabel="My Location button"
        accessibilityHint="Double tap to get your current location"
      >
        <Text style={[styles.myLocationText, isDark && styles.darkMyLocationText]}>
          My Location
        </Text>
      </TouchableOpacity>

      <View style={[styles.infoContainer, isDark && styles.darkInfoContainer]}>
        <Text 
          style={[styles.infoText, isDark && styles.darkInfoText]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {location
            ? location.address || `Latitude: ${location.latitude.toFixed(6)}\nLongitude: ${location.longitude.toFixed(6)}`
            : 'Getting your location...'}
        </Text>
        {location && (
          <Text 
            style={[styles.coordinatesText, isDark && styles.darkCoordinatesText]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            Lat: {location.latitude.toFixed(6)}, Long: {location.longitude.toFixed(6)}
          </Text>
        )}
        {errorMsg && (
          <View style={styles.errorContainer}>
            <Text 
              style={[styles.errorText, isDark && styles.darkErrorText]}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {errorMsg}
            </Text>
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

      {isLoading && (
        <View style={[styles.loadingOverlay, isDark && styles.darkLoadingOverlay]}>
          <ActivityIndicator size="large" color={isDark ? '#fff' : '#000'} />
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
    backgroundColor: '#fff',
  },
  darkContainer: {
    backgroundColor: '#000',
  },
  map: {
    width: width,
    height: height,
  },
  searchContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
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
  darkSearchContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#000',
    paddingHorizontal: 8,
  },
  darkSearchInput: {
    color: '#fff',
  },
  searchIndicator: {
    marginLeft: 8,
  },
  searchResults: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 110 : 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    maxHeight: 200,
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
  darkSearchResults: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  darkResultItem: {
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  lastResultItem: {
    borderBottomWidth: 0,
  },
  resultText: {
    fontSize: 14,
    color: '#000',
  },
  darkResultText: {
    color: '#fff',
  },
  myLocationButton: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 160,
    alignSelf: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
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
  darkMyLocationButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  myLocationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  darkMyLocationText: {
    color: '#fff',
  },
  infoContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 20 : 80,
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
    maxWidth: '100%',
  },
  darkInfoContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoText: {
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
    flexWrap: 'wrap',
    maxWidth: '100%',
  },
  darkInfoText: {
    color: '#fff',
  },
  coordinatesText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
    flexWrap: 'wrap',
    maxWidth: '100%',
  },
  darkCoordinatesText: {
    color: '#999',
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
    flexWrap: 'wrap',
    maxWidth: '100%',
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  darkLoadingOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#000',
  },
  darkLoadingText: {
    color: '#fff',
  },
}); 