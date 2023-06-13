declare global {
    namespace NodeJS {
        interface ProcessEnv {
            FIREBASE_CONFIG: string
            SEND_GRID_API_KEY: string
            ACUITY_USER_ID: string
            ACUITY_API_KEY: string
            STRIPE_WEBHOOK_SECRET_PROD: string
            STRIPE_WEBHOOK_SECRET_DEV: string
            SLING_API_KEY: string
            XERO_CLIENT_ID: string
            XERO_CLIENT_SECRET: string
            ESIGNATURES_SECRET: string
        }
    }
}

export {}
