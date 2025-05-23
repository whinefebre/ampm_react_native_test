import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LocationData } from '../../types/location';
import { colors, commonStyles, getPlatformSpecificValue } from './styles';

interface LocationInfoProps {
  location: LocationData | null;
  errorMsg: string | null;
  onRetry: () => void;
  isDark: boolean;
}

export const LocationInfo: React.FC<LocationInfoProps> = ({
  location,
  errorMsg,
  onRetry,
  isDark,
}) => (
  <View 
    style={[
      commonStyles.container,
      isDark && commonStyles.darkContainer,
      styles.infoContainer,
    ]}
    accessibilityRole="summary"
    accessibilityLabel="Location information"
  >
    <Text 
      style={[commonStyles.text, isDark && commonStyles.darkText]}
      numberOfLines={2}
      ellipsizeMode="tail"
      accessibilityRole="text"
    >
      {location
        ? location.address || `Latitude: ${location.latitude.toFixed(6)}\nLongitude: ${location.longitude.toFixed(6)}`
        : 'Getting your location...'}
    </Text>
    {location && (
      <Text 
        style={[commonStyles.secondaryText, isDark && commonStyles.darkSecondaryText]}
        numberOfLines={1}
        ellipsizeMode="tail"
        accessibilityRole="text"
      >
        Lat: {location.latitude.toFixed(6)}, Long: {location.longitude.toFixed(6)}
      </Text>
    )}
    {errorMsg && (
      <View style={styles.errorContainer}>
        <Text 
          style={[commonStyles.errorText, isDark && commonStyles.darkErrorText]}
          numberOfLines={2}
          ellipsizeMode="tail"
          accessibilityRole="alert"
        >
          {errorMsg}
        </Text>
        <TouchableOpacity
          style={[commonStyles.button, isDark && commonStyles.darkButton]}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Retry button"
          accessibilityHint="Double tap to retry getting location"
        >
          <Text style={commonStyles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  infoContainer: {
    bottom: getPlatformSpecificValue(20, 80),
    padding: 16,
    zIndex: 0,
    maxWidth: '100%',
  },
  errorContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
}); 