declare module 'roughjs/bundled/rough.esm.js' {
  import rough from 'roughjs/bin/rough';
  export default rough;
}

declare module '*?raw' {
  const source: string;
  export default source;
}
