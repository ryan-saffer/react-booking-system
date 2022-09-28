/// <reference types="react-scripts" />

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            REACT_APP_ENV: 'prod' | 'dev'
            REACT_APP_MIXPANEL_API_KEY_DEV: string
            REACT_APP_MIXPANEL_API_KEY_PROD: string
        }
    }
}

export {}
