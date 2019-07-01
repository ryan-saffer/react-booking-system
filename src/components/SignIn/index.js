import React from 'react'
import { withRouter } from 'react-router-dom'
import { compose } from 'recompose'

import { withFirebase } from '../Firebase/context'
import SignInGoogleBase from './SignInGoogleBase'


const SignInPage = () => (
    <div>
        <h1>Sign In Page</h1>
        <SignInGoogle />
    </div>
)

const SignInGoogle = compose(
    withRouter,
    withFirebase,
)(SignInGoogleBase)

export default SignInPage
export { SignInPage, SignInGoogle }