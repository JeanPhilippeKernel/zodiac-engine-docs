/// <reference types="vite/client" />

declare module 'virtual:documentation' {
  export const documents: import('./lib/content').DocumentMeta[];
  export const home: import('./lib/content').HomeData;
  export const releases: import('./lib/content').ReleasesData;
}

declare module 'virtual:documentation-search' {
  export const documents: import('./lib/content').DocumentMeta[];
}
