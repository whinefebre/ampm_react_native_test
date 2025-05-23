import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { LocationWithAddress } from '../types';

export const useLocation = () => {
  const [location, setLocation] = useState<LocationWithAddress | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = currentLocation.coords;
      
      const [address] = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      setLocation({
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
        address: address ? `${address.street}, ${address.city}, ${address.country}` : undefined,
      });
    } catch (error) {
      setErrorMsg('Error getting location');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  return { location, errorMsg, loading, refreshLocation: getLocation };
}; 