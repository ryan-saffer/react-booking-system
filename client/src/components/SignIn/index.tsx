import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import useFirebase from '@components/Hooks/context/UseFirebase'
import * as ROUTES from '@constants/routes'
import * as FizzLogo from '@drawables/FizzKidzLogoHorizontal.png'
import { Button, CssBaseline, Snackbar, TextField } from '@mui/material'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

import styles from './SignIn.module.css'
import SignInGoogle from './SignInGoogle'

const SignInPage = () => {
    const firebase = useFirebase()

    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [emailError, setEmailError] = useState(false)
    const [passwordError, setPasswordError] = useState(false)
    const [loading, setLoading] = useState(false)
    const [loginError, setLoginError] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        // 'keypress' event misbehaves on mobile so we track 'Enter' key via 'keydown' event
        if (e.key === 'Enter') {
            e.preventDefault()
            e.stopPropagation()
            handleSubmit()
        }
    }

    const handleSubmit = () => {
        setLoading(true)

        if (email === '') {
            setEmailError(true)
            setLoading(false)
            return
        }
        if (password === '') {
            setPasswordError(true)
            setLoading(false)
            return
        }

        firebase
            .doSignInWithEmailAndPassword(email, password)
            .then(() => {
                setLoading(false)
                navigate(ROUTES.LANDING)
            })
            .catch((err) => {
                console.error(err)
                setLoading(false)
                setErrorMessage(err.message)
                setLoginError(true)
            })
    }

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <div className={styles.main}>
                <img className={styles.logo} src={FizzLogo.default} alt="fizz kidz logo" />
                <Typography component="h1" variant="h5">
                    Sign in
                </Typography>
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
                    onChange={(e) => {
                        setEmailError(false)
                        setEmail(e.target.value)
                    }}
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
                    onChange={(e) => {
                        setPasswordError(false)
                        setPassword(e.target.value)
                    }}
                />
                <Button
                    className={styles.submitButton}
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
                    ContentProps={{ classes: { root: styles.snackBar } }}
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

export { SignInPage, SignInGoogle }
