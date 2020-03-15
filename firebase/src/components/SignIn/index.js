import React, { useState, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import { compose } from 'recompose'

import { withFirebase } from '../Firebase'
import SignInGoogleBase from './SignInGoogleBase'
import * as ROUTES from '../../constants/routes'

const SignInPage = props => {

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    const handleSubmit = e => {
        console.log(`username: ${username}`)
        console.log(`password: ${password}`)

        props.firebase.doSignInWithEmailAndPassword(username, password)
            .then(authUser => {
                props.firebase.db
                    .collection("users")
                    .doc(authUser.user.uid)
                    .set(
                        { username },
                        { merge: true }
                    )
                console.log("Done!")
                props.history.push(ROUTES.BOOKINGS)
            })
            .catch(err => {
                console.log(err)
            })
    }

    return (
        <div>
            <h1>Sign In Page</h1>
            <SignInGoogle />

            <form onSubmit={handleSubmit}>
                <input type="text" name="userName" onChange={e => setUsername(e.target.value)} />
                <input type="password" name="password" onChange={e => setPassword(e.target.value)} />
                <input type="button" value="Submit" onClick={handleSubmit} />
            </form>
        </div>
    )
}

const SignInGoogle = compose(
    withRouter,
    withFirebase,
)(SignInGoogleBase)

export default withFirebase(SignInPage)
export { SignInPage, SignInGoogle }