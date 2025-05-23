import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { useLocation } from '../hooks/useLocation';
import { lightTheme, darkTheme } from '../theme/theme';

export const HomeScreen = () => {
  const { location, errorMsg, loading, refreshLocation } = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  if (errorMsg) {
    Alert.alert('Location Error', errorMsg);
  }

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const mapRegion: Region = location ? {
    latitude: location.latitude,
    longitude: location.longitude,
    latitudeDelta: location.latitudeDelta || 0.0922,
    longitudeDelta: location.longitudeDelta || 0.0421,
  } : {
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {location && (
        <>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={mapRegion}
            showsUserLocation
            showsMyLocationButton
          >
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="Current Location"
              description={location.address}
            />
          </MapView>
          
          <View style={[styles.infoContainer, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.text, { color: theme.colors.text }]}>
              Latitude: {location.latitude.toFixed(6)}
            </Text>
            <Text style={[styles.text, { color: theme.colors.text }]}>
              Longitude: {location.longitude.toFixed(6)}
            </Text>
            {location.address && (
              <Text style={[styles.text, { color: theme.colors.text }]}>
                Address: {location.address}
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.refreshButton, { backgroundColor: theme.colors.primary }]}
            onPress={refreshLocation}
          >
            <Text style={styles.buttonText}>Refresh Location</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    padding: 15,
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  text: {
    fontSize: 16,
    marginBottom: 5,
  },
  refreshButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 