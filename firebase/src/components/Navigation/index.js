import React, { useContext } from 'react'
import { withRouter } from 'react-router-dom'
import { compose } from 'recompose'

import { CssBaseline, AppBar, Toolbar, Typography, makeStyles, Paper, Button } from '@material-ui/core'
import { grey, red } from '@material-ui/core/colors'
import Container from '@material-ui/core/Container'

import * as ROUTES from '../../constants/routes'
import { withAuthorization } from '../Session'
import * as Logo from '../../drawables/FizzKidzLogoHorizontal.png'
import useRole from '../Hooks/UseRole'
import { FirebaseContext } from '../Firebase'
import { Roles } from '../../constants/roles'

const useStyles = makeStyles(theme => ({
    appBar: {
        zIndex: theme.zIndex.drawer + 1
    },
    toolbar: {
        justifyContent: 'center'
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
        "&:hover": {
            backgroundColor: grey[100],
            cursor: "pointer"
        }
    },
    logo: {
        height: 50
    },
    adminHeading: {
        marginTop: 12
    },
    signOutButton: {
        width: '100%',
        marginTop: theme.spacing(4),
        backgroundColor: red[400],
        "&:hover": {
            backgroundColor: red[500]
        }
    }
}))

const Navigation = props => {
    
    const classes = useStyles()

    const role = useRole()
    const isAdmin = role === Roles.ADMIN
    const isRestricted = role === Roles.RESTRICTED

    const firebase = useContext(FirebaseContext)

    const navigateToRoute = route => {
        props.history.push(route)
    }
    
    return (
        <>
            <CssBaseline/>
            <AppBar position='static' className={classes.appBar}>
                <Toolbar className={classes.toolbar}>
                    <img className={classes.logo} src={Logo.default} />
                </Toolbar>
            </AppBar>
            <div className={classes.main}>
                <Container component="main" maxWidth="sm">
                    <Paper className={classes.paper} onClick={() => navigateToRoute(ROUTES.BOOKINGS)}>
                        <Typography>Birthday Parties</Typography>
                    </Paper>
                    {!isRestricted &&
                        <>
                            <Paper className={classes.paper} onClick={() => navigateToRoute(ROUTES.HOLIDAY_PROGRAM_SELECT_CLASS)}>
                                <Typography>Holiday Programs</Typography>
                            </Paper>
                            <Paper className={classes.paper} onClick={() => navigateToRoute(ROUTES.SCIENCE_CLUB_SELECT_CLASS)}>
                                <Typography>After School Science Program</Typography>
                            </Paper>
                        </>
                    }
                    {isAdmin && <>
                        <Typography className={classes.adminHeading} variant="h6">Admin Tools</Typography>
                        <Paper className={classes.paper} onClick={() => navigateToRoute(ROUTES.SCIENCE_CLUB_INVOICING_SELECT_CLASS)}>
                            <Typography>Invoicing - Science Club</Typography>
                        </Paper>
                        </>
                    }
                    <Button className={classes.signOutButton} variant="contained" onClick={firebase.doSignOut}>
                            Sign out
                    </Button>
                </Container>
            </div>
        </>
    )
}

export default compose(
    withRouter,
    withAuthorization,
)(Navigation)