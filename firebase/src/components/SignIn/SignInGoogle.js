import React, { useState, useContext } from 'react'

import * as ROUTES from '../../constants/routes'
import * as GoogleLogo from '../../drawables/google-logo.png'

import { makeStyles } from '@material-ui/core/styles'
import { Snackbar, Button } from '@material-ui/core'
import { red } from '@material-ui/core/colors'
import { FirebaseContext } from '../Firebase'
import { useNavigate } from 'react-router-dom'

const useStyles = makeStyles((theme) => ({
    signInButton: {
        height: 36,
        marginTop: theme.spacing(2),
        '&:hover': {
            cursor: 'pointer',
        },
    },
    signInWithGoogleButton: {
        height: 36,
        marginTop: theme.spacing(2),
    },
    googleLogo: {
        height: 30,
    },
    snackBar: {
        backgroundColor: red[500],
    },
}))

const SignInGoogle = (props) => {
    const classes = useStyles()

    const firebase = useContext(FirebaseContext)

    const navigate = useNavigate()

    const [error, setError] = useState(null)

    const handleSubmit = (event) => {
        firebase
            .doSignInWithGoogle()
            .then(() => {
                setError(null)
                navigate(ROUTES.LANDING)
            })
            .catch((error) => {
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
                startIcon={<img className={classes.googleLogo} src={GoogleLogo.default} alt="Google logo" />}
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

export default SignInGoogle
