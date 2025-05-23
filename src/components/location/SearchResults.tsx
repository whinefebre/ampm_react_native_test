import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LocationData } from '../../types/location';
import { colors, commonStyles, getPlatformSpecificValue } from './styles';

interface SearchResultsProps {
  results: LocationData[];
  onResultPress: (result: LocationData) => void;
  isDark: boolean;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  onResultPress,
  isDark,
}) => (
  <View 
    style={[
      commonStyles.container,
      isDark && commonStyles.darkContainer,
      styles.searchResults,
    ]}
    accessibilityRole="list"
    accessibilityLabel="Search results"
  >
    {results.map((result, index) => (
      <TouchableOpacity
        key={index}
        style={[
          styles.resultItem,
          isDark && styles.darkResultItem,
          index === results.length - 1 && styles.lastResultItem,
        ]}
        onPress={() => onResultPress(result)}
        accessibilityRole="button"
        accessibilityLabel={`Select location: ${result.address || `Latitude ${result.latitude}, Longitude ${result.longitude}`}`}
        accessibilityHint="Double tap to select this location"
      >
        <Text
          style={[commonStyles.text, isDark && commonStyles.darkText]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {result.address || `Lat: ${result.latitude.toFixed(6)}, Long: ${result.longitude.toFixed(6)}`}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

const styles = StyleSheet.create({
  searchResults: {
    top: getPlatformSpecificValue(110, 100),
    maxHeight: 200,
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  darkResultItem: {
    borderBottomColor: colors.dark.border,
  },
  lastResultItem: {
    borderBottomWidth: 0,
  },
}); 