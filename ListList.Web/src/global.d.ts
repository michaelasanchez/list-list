declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export = classes;
}

declare module '*.jpg' {
  const value: any;
  export default value;
}
