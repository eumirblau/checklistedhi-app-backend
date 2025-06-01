declare namespace JSX {
  interface Element extends React.ReactElement<any, any> { }
  interface ElementClass extends React.Component<any> {
    render(): React.ReactNode
  }
  interface ElementAttributesProperty { props: {} }
  interface ElementChildrenAttribute { children: {} }
}

declare module "react" {
  export = React;
  export as namespace React;
  
  declare namespace React {
    export interface ComponentType<P = {}> {
      (props: P, context?: any): ReactElement<any, any> | null;
      propTypes?: WeakValidationMap<P> | undefined;
      contextTypes?: ValidationMap<any> | undefined;
      defaultProps?: Partial<P> | undefined;
      displayName?: string | undefined;
    }
  }
}
