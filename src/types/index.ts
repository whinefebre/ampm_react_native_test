export interface Location {
  latitude: number;
  longitude: number;
  latitudeDelta?: number;
  longitudeDelta?: number;
}

export interface LocationWithAddress extends Location {
  address?: string;
}

export type RootStackParamList = {
  Home: undefined;
}; 