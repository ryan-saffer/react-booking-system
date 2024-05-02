declare global {
    namespace NodeJS {
        interface ProcessEnv {
            FIREBASE_CONFIG: string
            FUNCTIONS_EMULATOR: string
            SEND_GRID_API_KEY: string
            ACUITY_USER_ID: string
            ACUITY_API_KEY: string
            STRIPE_WEBHOOK_SECRET_PROD: string
            STRIPE_WEBHOOK_SECRET_DEV: string
            SLING_API_KEY: string
            DEV_XERO_CLIENT_ID: string
            DEV_XERO_CLIENT_SECRET: string
            XERO_CLIENT_ID: string
            XERO_CLIENT_SECRET: string
            ESIGNATURES_SECRET: string
            MIXPANEL_API_KEY_DEV: string
            MIXPANEL_API_KEY_PROD: string
            ZOHO_REFRESH_TOKEN: string
            ZOHO_CLIENT_ID: string
            ZOHO_CLIENT_SECRET: string
        }
    }
}

export {}
