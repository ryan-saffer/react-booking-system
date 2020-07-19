import React, { useState } from 'react'
import { withRouter } from 'react-router-dom'
import { compose } from 'recompose'

import { withFirebase } from '../Firebase'
import SignInGoogleBase from './SignInGoogleBase'
import * as ROUTES from '../../constants/routes'
import * as FizzLogo from '../../drawables/FizzKidzLogoHorizontal.png'

import { makeStyles } from '@material-ui/core/styles'
import { CssBaseline, TextField, Button, Snackbar } from '@material-ui/core'
import Typography from '@material-ui/core/Typography'
import Container from '@material-ui/core/Container'
import { red } from '@material-ui/core/colors'

const useStyles = makeStyles(theme => ({
    main: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: theme.spacing(6)
    },
    logo: {
        maxWidth: 200,
        margin: theme.spacing(2)
    },
    submitButton: {
        marginTop: theme.spacing(1),
        color: 'white'
    },
    snackBar: {
        backgroundColor: red[500]
    }
}))

const SignInPage = props => {

    const classes = useStyles()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [emailError, setEmailError] = useState(false)
    const [passwordError, setPasswordError] = useState(false)
    const [loading, setLoading] = useState(false)
    const [loginError, setLoginError] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    const onKeyDown = e => {
      // 'keypress' event misbehaves on mobile so we track 'Enter' key via 'keydown' event
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        handleSubmit(e);
      }
    }

    const handleSubmit = e => {

        setLoading(true)

        if (email === "") { setEmailError(true); setLoading(false); return }
        if (password === "") { setPasswordError(true); setLoading(false); return }

        props.firebase.doSignInWithEmailAndPassword(email, password)
            .then(authUser => {
                props.firebase.db
                    .collection("users")
                    .doc(authUser.user.uid)
                    .set(
                        { username: email },
                        { merge: true }
                    )
                setLoading(false)
                props.history.push(ROUTES.LANDING)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
                setErrorMessage(err.message)
                setLoginError(true)
            })
    }

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <div className={classes.main}>
                <img className={classes.logo} src={FizzLogo.default} alt="fizz kidz logo" />
                <Typography component="h1" variant="h5">Sign in</Typography>
                <TextField
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    error={emailError}
                    onKeyDown={onKeyDown}
                    onChange={e => { setEmailError(false); setEmail(e.target.value) }}
                />
                <TextField
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    error={passwordError}
                    onKeyDown={onKeyDown}
                    onChange={e => { setPasswordError(false); setPassword(e.target.value) }}
                />
                <Button
                    className={classes.submitButton}
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="secondary"
                    disabled={loading}
                    onClick={handleSubmit}
                >
                    Sign in
                </Button>
                <SignInGoogle />
                <Snackbar
                    ContentProps={{ classes: { root: classes.snackBar } }}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    autoHideDuration={4000}
                    open={loginError}
                    message={errorMessage}
                    onClose={() => setLoginError(false)}
                />
            </div>
        </Container>
    )
}

const SignInGoogle = compose(
    withRouter,
    withFirebase,
)(SignInGoogleBase)

export default withFirebase(SignInPage)
export { SignInPage, SignInGoogle }