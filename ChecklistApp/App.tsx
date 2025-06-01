import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LogBox } from 'react-native';
import LoginScreen from './src/screens/LoginScreen';
import JefesScreen from './src/screens/JefesScreen';
import ObrasScreen from './src/screens/ObrasScreen';
import InstalacionesScreen from './src/screens/InstalacionesScreen';
import ChecklistScreen from './src/screens/ChecklistScreen';

// Suppress known warnings during development
LogBox.ignoreLogs([
  'Warning: Text strings must be rendered within a <Text> component',
  'VirtualizedLists should never be nested',
  'Failed to construct URL',
  'Remote debugger',
]);

const Stack = createStackNavigator();



function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="LoginScreen"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="LoginScreen"
          component={LoginScreen}
          options={{ title: 'Iniciar Sesión' }}
        />
        <Stack.Screen
          name="JefesScreen"
          component={JefesScreen}
          options={{ title: 'Jefes de Grupo' }}
        />
        <Stack.Screen
          name="ObrasScreen"
          component={ObrasScreen}
          options={{ title: 'Obras' }}
        />
        <Stack.Screen
          name="InstalacionesScreen"
          component={InstalacionesScreen}
          options={{ title: 'Instalaciones' }}
        />
        <Stack.Screen
          name="ChecklistScreen"
          component={ChecklistScreen}
          options={{ title: 'Checklist' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
