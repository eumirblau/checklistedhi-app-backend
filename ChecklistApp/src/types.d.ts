// React Native Navigation types
export type RootStackParamList = {
  LoginScreen: undefined;
  JefesScreen: {
    usuario: string;
  };
  ObrasScreen: {
    usuario: string;
    instalacionId: string;
    instalacionNombre: string;
  };
  InstalacionesScreen: {
    usuario: string;
    instalacionId: string;
    instalacionNombre: string;
    obraNombre: string;
  };
  ChecklistScreen: {
    instalacionId: string;
    instalacionNombre: string;
    spreadsheetId: string;
    usuario: string;
    obraNombre: string;
  };
};

// Global JSX namespace override for React Native compatibility
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
      LinearGradient: any;
    }
    interface ElementClass {
      render(): any;
    }
    interface Element {
      type: any;
      props: any;
      key: any;
    }
  }
}
