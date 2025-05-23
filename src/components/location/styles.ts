import { StyleSheet, Platform } from 'react-native';

export const colors = {
  light: {
    background: '#fff',
    text: '#000',
    secondaryText: '#666',
    error: '#ff3b30',
    primary: '#007AFF',
    overlay: 'rgba(255, 255, 255, 0.95)',
    border: 'rgba(0, 0, 0, 0.1)',
  },
  dark: {
    background: '#000',
    text: '#fff',
    secondaryText: '#999',
    error: '#ff453a',
    primary: '#0A84FF',
    overlay: 'rgba(0, 0, 0, 0.8)',
    border: 'rgba(255, 255, 255, 0.1)',
  },
};

export const commonStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: colors.light.overlay,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1,
  },
  darkContainer: {
    backgroundColor: colors.dark.overlay,
    borderColor: colors.dark.border,
  },
  text: {
    fontSize: 14,
    color: colors.light.text,
  },
  darkText: {
    color: colors.dark.text,
  },
  secondaryText: {
    fontSize: 12,
    color: colors.light.secondaryText,
  },
  darkSecondaryText: {
    color: colors.dark.secondaryText,
  },
  errorText: {
    color: colors.light.error,
    fontSize: 14,
    textAlign: 'center',
  },
  darkErrorText: {
    color: colors.dark.error,
  },
  button: {
    backgroundColor: colors.light.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  darkButton: {
    backgroundColor: colors.dark.primary,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export const getPlatformSpecificValue = (iosValue: number, androidValue: number) => 
  Platform.OS === 'ios' ? iosValue : androidValue; 