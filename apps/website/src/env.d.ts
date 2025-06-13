/// <reference path="../.astro/types.d.ts" />
interface ImportMetaEnv {
  STORYBLOK_TOKEN: string;
  PUBLIC_UPLOADTHING_TOKEN: string;
  NETLIFY_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
