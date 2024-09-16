interface ImportMetaEnv {
  STORYBLOK_TOKEN: string;
  UPLOADTHING_SECRET: string;
  NETLIFY_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
