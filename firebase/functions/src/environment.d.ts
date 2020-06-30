declare global {
  namespace NodeJS {
    interface ProcessEnv {
      FIREBASE_CONFIG: string;
    }
  }
}

export {}