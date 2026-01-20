/// <reference types="vite/client" />

// Unified Firebase config variables (use .env for dev, .env.prod for prod)
interface ImportMetaEnv {
    readonly VITE_ENV: 'prod' | 'dev'

    readonly VITE_APP_VERSION: string
    readonly VITE_APP_BUILT_AT: string

    readonly VITE_FIREBASE_API_KEY: string
    readonly VITE_FIREBASE_AUTH_DOMAIN: string
    readonly VITE_FIREBASE_DATABASE_URL: string
    readonly VITE_FIREBASE_PROJECT_ID: string
    readonly VITE_FIREBASE_STORAGE_BUCKET: string
    readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
    readonly VITE_FIREBASE_APP_ID: string
    readonly VITE_FIREBASE_MEASUREMENT_ID: string

    readonly VITE_MIXPANEL_API_KEY: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
