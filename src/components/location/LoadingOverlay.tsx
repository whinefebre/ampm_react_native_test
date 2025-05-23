import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from './styles';

interface LoadingOverlayProps {
  isDark: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isDark }) => (
  <View 
    style={[styles.loadingOverlay, isDark && styles.darkLoadingOverlay]}
    accessibilityRole="progressbar"
    accessibilityLabel="Loading location"
  >
    <ActivityIndicator 
      size="large" 
      color={isDark ? colors.dark.text : colors.light.text}
      accessibilityLabel="Loading indicator"
    />
    <Text 
      style={[styles.loadingText, isDark && styles.darkLoadingText]}
      accessibilityRole="text"
    >
      Getting your location...
    </Text>
  </View>
);

const styles = StyleSheet.create({
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
    color: colors.light.text,
  },
  darkLoadingText: {
    color: colors.dark.text,
  },
}); 