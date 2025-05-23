import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, commonStyles, getPlatformSpecificValue } from './styles';

interface MyLocationButtonProps {
  onPress: () => void;
  isDark: boolean;
}

export const MyLocationButton: React.FC<MyLocationButtonProps> = ({ onPress, isDark }) => (
  <TouchableOpacity
    style={[
      commonStyles.container,
      isDark && commonStyles.darkContainer,
      styles.myLocationButton,
    ]}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel="My Location button"
    accessibilityHint="Double tap to get your current location"
  >
    <Text style={[commonStyles.text, isDark && commonStyles.darkText]}>
      My Location
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  myLocationButton: {
    bottom: getPlatformSpecificValue(100, 160),
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
}); 