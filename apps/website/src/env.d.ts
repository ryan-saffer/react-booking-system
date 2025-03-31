interface ImportMetaEnv {
  STORYBLOK_TOKEN: string;
  UPLOADTHING_TOKEN: string;
  NETLIFY_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
