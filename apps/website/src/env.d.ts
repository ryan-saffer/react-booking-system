interface ImportMetaEnv {
  STORYBLOK_TOKEN: string;
  UPLOADTHING_SECRET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
