import { useNavigate } from 'react-router-dom'

import { useScopes } from '@components/Hooks/UseScopes'
import useFirebase from '@components/Hooks/context/UseFirebase'
import * as ROUTES from '@constants/routes'
import * as Logo from '@drawables/FizzKidzLogoHorizontal.png'
import { Launch as LaunchIcon } from '@mui/icons-material'
import { AppBar, Button, Container, CssBaseline, Paper, Toolbar, Typography } from '@mui/material'
import { grey, red } from '@mui/material/colors'
import { styled } from '@mui/material/styles'

const PREFIX = 'Navigation'

const classes = {
    appBar: `${PREFIX}-appBar`,
    toolbar: `${PREFIX}-toolbar`,
    main: `${PREFIX}-main`,
    paper: `${PREFIX}-paper`,
    logo: `${PREFIX}-logo`,
    heading: `${PREFIX}-heading`,
    signOutButton: `${PREFIX}-signOutButton`,
}

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')(({ theme }) => ({
    [`& .${classes.appBar}`]: {
        zIndex: theme.zIndex.drawer + 1,
    },

    [`& .${classes.toolbar}`]: {
        justifyContent: 'center',
    },

    [`& .${classes.main}`]: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: theme.spacing(3),
    },

    [`& .${classes.paper}`]: {
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

    [`& .${classes.logo}`]: {
        height: 50,
    },

    [`& .${classes.heading}`]: {
        marginTop: 12,
    },

    [`& .${classes.signOutButton}`]: {
        width: '100%',
        marginTop: theme.spacing(4),
        backgroundColor: red[400],
        '&:hover': {
            backgroundColor: red[500],
        },
        color: 'black',
    },
}))

export const Navigation = () => {
    const navigate = useNavigate()

    const scopes = useScopes()
    const hasCoreScopes = scopes.CORE !== 'none'
    const isRestricted = scopes.CORE === 'restricted'
    const hasCoreWriteScope = scopes.CORE === 'write'
    const hasPayrollWriteScope = scopes.PAYROLL === 'write'

    const firebase = useFirebase()

    const navigateToRoute = (route: string) => {
        navigate(route)
    }

    return (
        <Root>
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
                                    <Typography className={classes.heading} variant="h6">
                                        Creations
                                    </Typography>
                                    <Paper className={classes.paper} onClick={() => navigateToRoute(ROUTES.CREATIONS)}>
                                        <Typography>Creation Instructions</Typography>
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
                            {hasCoreWriteScope && (
                                <Paper className={classes.paper} onClick={() => navigateToRoute(ROUTES.ONBOARDING)}>
                                    <Typography>Onboarding</Typography>
                                </Paper>
                            )}
                        </>
                    )}

                    <Button className={classes.signOutButton} variant="contained" onClick={firebase.doSignOut}>
                        Sign out
                    </Button>
                </Container>
            </div>
        </Root>
    )
}
