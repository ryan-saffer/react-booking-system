declare global {
    namespace NodeJS {
        interface ProcessEnv {
            FIREBASE_CONFIG: string
            SEND_GRID_API_KEY: string
            ACUITY_USER_ID: string
            ACUITY_API_KEY: string
            STRIPE_WEBHOOK_SECRET: string
        }
    }
}

export {}
