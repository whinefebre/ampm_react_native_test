import { Region } from 'react-native-maps';

export interface LocationData extends Region {
  address?: string;
}

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  name?: string;
  street?: string;
  city?: string;
  region?: string;
  country?: string;
}

export interface ReverseGeocodeResult {
  street?: string;
  city?: string;
  region?: string;
  country?: string;
}

export const INITIAL_REGION: Region = {
  latitude: 37.4219983,
  longitude: -122.084,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
}; 