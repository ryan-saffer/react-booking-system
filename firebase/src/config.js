export const devConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_DEV_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_DEV_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_FIREBASE_DEV_DATABASE_URL,
    projectId: process.env.REACT_APP_FIREBASE_DEV_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_DEV_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_DEV_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_DEV_APP_ID
};

export const prodConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_PROD_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_PROD_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_FIREBASE_PROD_DATABASE_URL,
    projectId: process.env.REACT_APP_FIREBASE_PROD_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_PROD_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_PROD_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_PROD_APP_ID
}