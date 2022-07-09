declare global {
  namespace NodeJS {
    interface ProcessEnv {
      FIREBASE_CONFIG: string;
      SEND_GRID_API_KEY: string;
    }
  }
}

export {}