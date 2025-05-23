import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Platform,
  Keyboard,
  useColorScheme,
  Dimensions,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { LocationAccuracy } from 'expo-location';
import { LocationData } from '../types/location';
import {
  SearchBar,
  SearchResults,
  LocationInfo,
  LoadingOverlay,
  MyLocationButton,
} from '../components/location';

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
          address: address ? `${address.street}, ${address.city}` : undefined,
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

      const newLocation: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: address ? `${address.street}, ${address.city}` : undefined,
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
              address: address ? `${address.street}, ${address.city}` : undefined,
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

      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        isSearching={isSearching}
        isDark={isDark}
      />

      {searchResults.length > 0 && (
        <SearchResults
          results={searchResults}
          onResultPress={handleResultPress}
          isDark={isDark}
        />
      )}

      <MyLocationButton
        onPress={handleMyLocationPress}
        isDark={isDark}
      />

      <LocationInfo
        location={location}
        errorMsg={errorMsg}
        onRetry={handleMyLocationPress}
        isDark={isDark}
      />

      {isLoading && <LoadingOverlay isDark={isDark} />}
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
}); 