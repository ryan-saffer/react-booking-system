import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'

import { CssBaseline, AppBar, Toolbar, Typography, makeStyles, Paper, Button } from '@material-ui/core'
import { grey, red } from '@material-ui/core/colors'
import Container from '@material-ui/core/Container'
import LaunchIcon from '@material-ui/icons/Launch'

import * as ROUTES from '../../constants/routes'
import * as Logo from '../../drawables/FizzKidzLogoHorizontal.png'
import { FirebaseContext } from '../Firebase'
import { useScopes } from '../Hooks/UseScopes'

const useStyles = makeStyles((theme) => ({
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
    },
    toolbar: {
        justifyContent: 'center',
    },
    main: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        margin: theme.spacing(3),
    },
    paper: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        padding: theme.spacing(2),
        '&:hover': {
            backgroundColor: grey[100],
            cursor: 'pointer',
        },
        display: 'flex',
        justifyContent: 'space-between',
    },
    logo: {
        height: 50,
    },
    heading: {
        marginTop: 12,
    },
    signOutButton: {
        width: '100%',
        marginTop: theme.spacing(4),
        backgroundColor: red[400],
        '&:hover': {
            backgroundColor: red[500],
        },
    },
}))

export const Navigation = () => {
    const classes = useStyles()

    const navigate = useNavigate()

    const scopes = useScopes()
    const hasCoreScopes = scopes.CORE !== 'none'
    const isRestricted = scopes.CORE === 'restricted'
    const hasCoreWriteScope = scopes.CORE === 'write'
    const hasPayrollWriteScope = scopes.PAYROLL === 'write'

    const firebase = useContext(FirebaseContext)

    const navigateToRoute = (route) => {
        navigate(route)
    }

    return (
        <>
            <CssBaseline />
            <AppBar position="static" className={classes.appBar}>
                <Toolbar className={classes.toolbar}>
                    <img className={classes.logo} src={Logo.default} alt="Fizz Kidz Logo" />
                </Toolbar>
            </AppBar>
            <div className={classes.main}>
                <Container component="main" maxWidth="sm">
                    {hasCoreScopes && (
                        <>
                            <Typography className={classes.heading} variant="h6">
                                Programs
                            </Typography>
                            <Paper className={classes.paper} onClick={() => navigateToRoute(ROUTES.BOOKINGS)}>
                                <Typography>Parties & Events</Typography>
                            </Paper>
                            {!isRestricted && (
                                <>
                                    <Paper
                                        className={classes.paper}
                                        onClick={() => navigateToRoute(ROUTES.HOLIDAY_PROGRAM_SELECT_CLASS)}
                                    >
                                        <Typography>Holiday Programs</Typography>
                                    </Paper>
                                    <Paper
                                        className={classes.paper}
                                        onClick={() => navigateToRoute(ROUTES.SCIENCE_CLUB_SELECT_CLASS)}
                                    >
                                        <Typography>After School Science Program</Typography>
                                    </Paper>
                                </>
                            )}
                            <Typography className={classes.heading} variant="h6">
                                Useful Links
                            </Typography>
                            <Paper
                                className={classes.paper}
                                onClick={() =>
                                    window.open(
                                        'https://docs.google.com/forms/d/e/1FAIpQLSecOuuZ-k6j5z04aurXcgHrrak6I91wwePK57mVqlvyaib9qQ/viewform',
                                        '_blank'
                                    )
                                }
                            >
                                <Typography>Incident Reporting</Typography>
                                <LaunchIcon />
                            </Paper>
                        </>
                    )}
                    {(hasCoreWriteScope || hasPayrollWriteScope) && (
                        <>
                            <Typography className={classes.heading} variant="h6">
                                Admin
                            </Typography>
                            {hasCoreWriteScope && (
                                <Paper
                                    className={classes.paper}
                                    onClick={() => navigateToRoute(ROUTES.SCIENCE_CLUB_INVOICING_SELECT_CLASS)}
                                >
                                    <Typography>Invoicing - Science Club</Typography>
                                </Paper>
                            )}
                            {hasPayrollWriteScope && (
                                <Paper className={classes.paper} onClick={() => navigateToRoute(ROUTES.PAYROLL)}>
                                    <Typography>Payroll</Typography>
                                </Paper>
                            )}
                        </>
                    )}

                    <Button className={classes.signOutButton} variant="contained" onClick={firebase.doSignOut}>
                        Sign out
                    </Button>
                </Container>
            </div>
        </>
    )
}
