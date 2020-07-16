import * as config from '../../config'
const firebase = require('firebase/app')
require('firebase/auth')
require('firebase/firestore')
require('firebase/functions')

class Firebase {
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

  doCreateUserWithEmailAndPassword = (email, password) => 
    this.auth.createUserWithEmailAndPassword(email, password)
  
  doSignInWithEmailAndPassword = (email, password) =>
    this.auth.signInWithEmailAndPassword(email, password)

  doSignInWithGoogle = () =>
    this.auth.signInWithPopup(this.googleProvider)

  doSignOut = () => this.auth.signOut()
}

export default Firebase