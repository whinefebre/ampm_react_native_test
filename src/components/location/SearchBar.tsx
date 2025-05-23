import React from 'react';
import { View, TextInput, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, commonStyles, getPlatformSpecificValue } from './styles';

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: () => void;
  isSearching: boolean;
  isDark: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  handleSearch,
  isSearching,
  isDark,
}) => (
  <View 
    style={[
      commonStyles.container,
      isDark && commonStyles.darkContainer,
      styles.searchContainer,
    ]}
    accessibilityRole="search"
    accessibilityLabel="Search location"
  >
    <TextInput
      style={[styles.searchInput, isDark && styles.darkSearchInput]}
      placeholder="Search location..."
      placeholderTextColor={isDark ? colors.dark.secondaryText : colors.light.secondaryText}
      value={searchQuery}
      onChangeText={setSearchQuery}
      onSubmitEditing={handleSearch}
      returnKeyType="search"
      accessibilityLabel="Search location input"
      accessibilityHint="Enter a location to search"
      autoCapitalize="none"
      autoCorrect={false}
    />
    {isSearching && (
      <ActivityIndicator
        style={styles.searchIndicator}
        color={isDark ? colors.dark.text : colors.light.text}
        accessibilityLabel="Searching"
      />
    )}
  </View>
);

const styles = StyleSheet.create({
  searchContainer: {
    top: getPlatformSpecificValue(50, 40),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: colors.light.text,
    paddingHorizontal: 8,
  },
  darkSearchInput: {
    color: colors.dark.text,
  },
  searchIndicator: {
    marginLeft: 8,
  },
}); 