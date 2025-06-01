// React Native type declarations to fix React 19 compatibility issues

declare module 'react-native' {
  import React from 'react';

  // Fix JSX component types
  export interface ViewComponent extends React.Component<any, any> {}
  export interface TextComponent extends React.Component<any, any> {}
  export interface SwitchComponent extends React.Component<any, any> {}
  export interface ActivityIndicatorComponent extends React.Component<any, any> {}
  export interface RefreshControlComponent extends React.Component<any, any> {}
  export interface FlatListComponent extends React.Component<any, any> {}
  export interface TextInputComponent extends React.Component<any, any> {}
  export interface ModalComponent extends React.Component<any, any> {}
  export interface TouchableOpacityComponent extends React.Component<any, any> {}
    // Override existing component declarations
  export const View: React.ComponentClass<any>;
  export const Text: React.ComponentClass<any>;
  export const Switch: React.ComponentClass<any>;
  export const ActivityIndicator: React.ComponentClass<any>;
  export const RefreshControl: React.ComponentClass<any>;
  export const FlatList: React.ComponentClass<any>;
  export const TextInput: React.ComponentClass<any>;
  export const Modal: React.ComponentClass<any>;
  export const TouchableOpacity: React.ComponentClass<any>;
  export const ScrollView: React.ComponentClass<any>;
  export const KeyboardAvoidingView: React.ComponentClass<any>;
  export const Image: React.ComponentClass<any>;
  export const StatusBar: React.ComponentClass<any>;
  export const StyleSheet: any;
  export const Alert: any;
  export const LogBox: any;
  export const Platform: any;
}

declare module '@react-navigation/native' {
  import React from 'react';

  export const NavigationContainer: React.ComponentClass<any>;
  export interface RouteProp<ParamList, RouteName extends keyof ParamList> {
    key: string;
    name: RouteName;
    params: ParamList[RouteName];
  }
  export interface NavigationProp<ParamList> {
    navigate: (screen: keyof ParamList, params?: any) => void;
    goBack: () => void;
    reset: (state: any) => void;
  }
}

declare module '@react-navigation/stack' {
  import React from 'react';

  export interface StackNavigationProp<ParamList> {
    navigate: (screen: keyof ParamList, params?: any) => void;
    goBack: () => void;
    reset: (state: any) => void;
  }

  export function createStackNavigator(): {
    Navigator: React.ComponentClass<any>;
    Screen: React.ComponentClass<any>;
  };
}

declare module 'react-native-linear-gradient' {
  const LinearGradient: any;
  export default LinearGradient;
}
