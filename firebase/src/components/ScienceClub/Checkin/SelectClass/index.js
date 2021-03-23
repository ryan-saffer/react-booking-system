import React from 'react'

import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import * as Logo from '../../../../drawables/FizzKidzLogoHorizontal.png'
import * as ROUTES from '../../../../constants/routes'
import ScienceClubClassSelection from '../../../Shared/ScienceClubClassSelection'

import { withAuthorization } from '../../../Session'

const ScienceClubCheckinClassSelection = props => {

    const cssClasses = useStyles()

    return (
        <>
        <CssBaseline />
        <AppBar className={cssClasses.appBar} position="static">
            <Toolbar className={cssClasses.toolbar}>
                <Typography className={cssClasses.title} variant="h6">
                    Science Club
                </Typography>
                <img
                    className={cssClasses.logo}
                    src={Logo}
                    onClick={() => props.history.push(ROUTES.LANDING)} />
            </Toolbar>
        </AppBar>
        <ScienceClubClassSelection classRoute={ROUTES.SCIENCE_CLUB_CLASS_DETAILS} />
        </>
    )
}

const useStyles = makeStyles(theme => ({
    appBar: {
        zIndex: theme.zIndex.drawer + 1
    },
    toolbar: {
        display: 'flex',
        justifyContent: 'space-between'
    },
    title: {
        marginRight: 'auto',
        flex: 1
    },
    logo: {
        height: 50,
        cursor: 'pointer'
    }
}));

export default withAuthorization(ScienceClubCheckinClassSelection)