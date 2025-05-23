import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useColorScheme } from 'react-native';
import LocationTracker from './src/screens/LocationTracker';

const Stack = createNativeStackNavigator();

export default function App() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="LocationTracker" 
          component={LocationTracker}
          options={{
            title: 'Whine Febre Location Tracker',
            headerStyle: {
              backgroundColor: isDark ? '#000000' : '#007AFF',
            },
            headerTintColor: isDark ? '#ffffff' : '#ffffff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
      </Stack.Navigator>
      <StatusBar style={isDark ? "light" : "dark"} />
    </NavigationContainer>
  );
}

