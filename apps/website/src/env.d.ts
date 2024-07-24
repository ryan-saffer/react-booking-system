interface ImportMetaEnv {
  STORYBLOK_TOKEN: string;
  UPLOADTHING_SECRET: string;
  INSTAGRAM_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
