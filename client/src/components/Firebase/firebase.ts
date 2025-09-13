import 'firebase/compat/auth'
import 'firebase/compat/firestore'
import 'firebase/compat/functions'
import 'firebase/compat/storage'

import firebase from 'firebase/compat/app'

export const useEmulators = false

class Firebase {
    auth: firebase.auth.Auth
    db: firebase.firestore.Firestore
    functions: firebase.functions.Functions
    googleProvider: firebase.auth.GoogleAuthProvider
    storage: firebase.storage.Storage

    constructor() {
        const app = firebase.initializeApp({
            apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
            authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
            databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
            projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
            storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
            appId: import.meta.env.VITE_FIREBASE_APP_ID,
            measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
        })

        this.auth = app.auth()
        this.db = app.firestore()
        this.functions = app.functions('australia-southeast1')
        if (useEmulators) {
            this.functions.useEmulator('localhost', 5001)
        }
        this.googleProvider = new firebase.auth.GoogleAuthProvider()
        this.storage = app.storage()
    }

    doCreateUserWithEmailAndPassword = (email: string, password: string) =>
        this.auth.createUserWithEmailAndPassword(email, password)

    doSignInWithEmailAndPassword = (email: string, password: string) =>
        this.auth.signInWithEmailAndPassword(email, password)

    doSignInWithGoogle = () => this.auth.signInWithPopup(this.googleProvider)

    doSignOut = async () => {
        await this.auth.signOut()
        localStorage.removeItem('authUser')
    }

    resetPassword = (email: string) => this.auth.sendPasswordResetEmail(email)
}

export default Firebase
