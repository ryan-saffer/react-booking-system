import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import useFirebase from '@components/Hooks/context/UseFirebase'
import * as ROUTES from '@constants/routes'
import * as GoogleLogo from '@drawables/google-logo.png'
import { Button, Snackbar } from '@mui/material'
import { red } from '@mui/material/colors'
import { styled } from '@mui/material/styles'

const PREFIX = 'SignInGoogle'

const classes = {
    signInButton: `${PREFIX}-signInButton`,
    signInWithGoogleButton: `${PREFIX}-signInWithGoogleButton`,
    googleLogo: `${PREFIX}-googleLogo`,
    snackBar: `${PREFIX}-snackBar`,
}

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')(({ theme }) => ({
    [`& .${classes.signInButton}`]: {
        height: 36,
        marginTop: theme.spacing(2),
        '&:hover': {
            cursor: 'pointer',
        },
    },

    [`& .${classes.signInWithGoogleButton}`]: {
        height: 36,
        marginTop: theme.spacing(2),
    },

    [`& .${classes.googleLogo}`]: {
        height: 30,
    },

    [`& .${classes.snackBar}`]: {
        backgroundColor: red[500],
    },
}))

const SignInGoogle = () => {
    const firebase = useFirebase()

    const navigate = useNavigate()

    const [error, setError] = useState<Error | null>(null)

    const handleSubmit = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()
        firebase
            .doSignInWithGoogle()
            .then(() => {
                setError(null)
                navigate(ROUTES.LANDING)
            })
            .catch((error) => {
                setError(error)
            })
    }

    return (
        <Root style={{ width: '100%' }}>
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
                open={!!error}
                message={error && error.message}
                onClose={() => setError(null)}
            />
        </Root>
    )
}

export default SignInGoogle
