/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_ENV: 'prod' | 'dev'

    readonly VITE_FIREBASE_DEV_API_KEY: string
    readonly VITE_FIREBASE_DEV_AUTH_DOMAIN: string
    readonly VITE_FIREBASE_DEV_DATABASE_URL: string
    readonly VITE_FIREBASE_DEV_PROJECT_ID: string
    readonly VITE_FIREBASE_DEV_STORAGE_BUCKET: string
    readonly VITE_FIREBASE_DEV_MESSAGING_SENDER_ID: string
    readonly VITE_FIREBASE_DEV_APP_ID: string
    readonly VITE_FIREBASE_DEV_MEASUREMENT_ID: string

    readonly VITE_FIREBASE_PROD_API_KEY: string
    readonly VITE_FIREBASE_PROD_AUTH_DOMAIN: string
    readonly VITE_FIREBASE_PROD_DATABASE_URL: string
    readonly VITE_FIREBASE_PROD_PROJECT_ID: string
    readonly VITE_FIREBASE_PROD_STORAGE_BUCKET: string
    readonly VITE_FIREBASE_PROD_MESSAGING_SENDER_ID: string
    readonly VITE_FIREBASE_PROD_APP_ID: string
    readonly VITE_FIREBASE_PROD_MEASUREMENT_ID: string

    readonly VITE_STRIPE_API_KEY_PROD: string
    readonly VITE_STRIPE_API_KEY_TEST: string

    readonly VITE_MIXPANEL_API_KEY_DEV: string
    readonly VITE_MIXPANEL_API_KEY_PROD: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
