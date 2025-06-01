// Global TypeScript declarations for React Native app
declare module 'react' {
  export function useState<S>(initialState: S | (() => S)): [S, (value: S | ((prevState: S) => S)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: readonly any[]): void;
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: readonly any[]): T;
  export function useMemo<T>(factory: () => T, deps: readonly any[]): T;
  export function useRef<T>(initialValue: T): { current: T };
  export function useContext<T>(context: any): T;

  export interface ReactElement<P = any, T = any> {
    type: T;
    props: P;
    key: string | number | null;
  }

  export interface Component<P = {}, S = {}> {
    props: P;
    state: S;
  }

  export interface FC<P = {}> {
    (props: P): ReactElement | null;
  }

  export interface FunctionComponent<P = {}> {
    (props: P): ReactElement | null;
  }

  export default React;
  declare namespace React {
    export type ComponentClass = any;
  }
}

declare global {
  namespace JSX {
    interface Element {
      type: any;
      props: any;
      key: string | number | null;
    }
  }
}
