import * as config from '../../config'
import firebase from 'firebase/app'
require('firebase/auth')
require('firebase/firestore')
require('firebase/functions')

class Firebase {

  auth: firebase.auth.Auth
  db: firebase.firestore.Firestore
  functions: firebase.functions.Functions
  googleProvider: firebase.auth.GoogleAuthProvider

  constructor() {
    const app = firebase.initializeApp(process.env.REACT_APP_ENV === 'prod' ? config.prodConfig : config.devConfig)

    this.auth = app.auth()
    this.db = app.firestore()
    this.functions = app.functions("australia-southeast1")
    // if (process.env.NODE_ENV === "development") {
    //   this.functions.useFunctionsEmulator("http://localhost:5001");
    // }
    this.googleProvider = new firebase.auth.GoogleAuthProvider()
  }

  doCreateUserWithEmailAndPassword = (email: string, password: string) => 
    this.auth.createUserWithEmailAndPassword(email, password)
  
  doSignInWithEmailAndPassword = (email: string, password: string) =>
    this.auth.signInWithEmailAndPassword(email, password)

  doSignInWithGoogle = () =>
    this.auth.signInWithPopup(this.googleProvider)

  doSignOut = () => this.auth.signOut()
}

export default Firebase