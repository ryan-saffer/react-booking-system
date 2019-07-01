import app from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

import * as config from '../../config'


class Firebase {
  constructor() {
    app.initializeApp(config.firebase)

    this.auth = app.auth()
    this.db = app.firestore()
    this.googleProvider = new app.auth.GoogleAuthProvider()
  }

  doSignInWithGoogle = () =>
    this.auth.signInWithPopup(this.googleProvider)

  doSignOut = () => this.auth.signOut()
}

export default Firebase