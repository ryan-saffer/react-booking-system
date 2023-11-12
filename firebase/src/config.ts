export const devConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_DEV_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_DEV_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_DEV_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_DEV_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_DEV_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_DEV_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_DEV_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_DEV_MEASUREMENT_ID,
}

export const prodConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_PROD_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_PROD_AUTH_DOMAIN,
    databaseURL: import.meta.env.VITE_FIREBASE_PROD_DATABASE_URL,
    projectId: import.meta.env.VITE_FIREBASE_PROD_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_PROD_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_PROD_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_PROD_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_PROD_MEASUREMENT_ID,
}
