import React, { useState } from 'react'

import * as ROUTES from '../../constants/routes'
import * as SignInGoogleButton from '../../drawables/sign-in-google-btn.png'
import * as GoogleLogo from '../../drawables/google-logo.png'

import { makeStyles } from '@material-ui/core/styles'
import { Snackbar, Button } from '@material-ui/core'
import { red } from '@material-ui/core/colors'

const useStyles = makeStyles(theme => ({
    signInButton: {
        height: 36,
        marginTop: theme.spacing(2),
        "&:hover": {
            cursor: "pointer"
        }
    },
    signInWithGoogleButton: {
        height: 36,
        marginTop: theme.spacing(2),
    },
    googleLogo: {
        height: 30
    },
    snackBar: {
        backgroundColor: red[500]
    }
}))

const SignInGoogleBase = props => {
    
    const classes = useStyles()

    const [error, setError] = useState(null)

    const handleSubmit = event => {
        props.firebase
            .doSignInWithGoogle()
            .then(socialAuthUser => {
                setError(null)
                props.firebase.db
                    .collection("users")
                    .doc(socialAuthUser.user.uid)
                    .set(
                        { email: socialAuthUser.user.email },
                        { merge: true }
                    )
                props.history.push(ROUTES.LANDING)
            })
            .catch(error => {
                setError(error)
            })
        event.preventDefault()
    }

    return (
        <>
            <Button
                className={classes.signInWithGoogleButton}
                onClick={handleSubmit}
                variant="outlined"
                fullWidth
                startIcon={<img className={classes.googleLogo} src={GoogleLogo} />}
            >
                Sign in with Google
            </Button>
            <Snackbar
                ContentProps={{ classes: { root: classes.snackBar } }}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                autoHideDuration={4000}
                open={error}
                message={error && error.message}
                onClose={() => setError(null)}
            />
        </>
    )
}

export default SignInGoogleBase