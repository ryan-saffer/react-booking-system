import React from 'react'
import { AppBar, CssBaseline, IconButton, makeStyles, Toolbar, Typography } from '@material-ui/core'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import { useHistory } from 'react-router-dom'

const Heading: React.FC = () => {
    const history = useHistory()
    const classes = useStyles()
    return (
        <>
            <CssBaseline />
            <AppBar position="static">
                <Toolbar className={classes.toolbar}>
                    <IconButton
                        className={classes.backBtn}
                        edge="start"
                        color="inherit"
                        onClick={() => history.goBack()}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" color="inherit">
                        Science Program Enrolment Dashboard
                    </Typography>
                </Toolbar>
            </AppBar>
        </>
    )
}

const useStyles = makeStyles({
    toolbar: {
        display: 'flex',
        justifyContent: 'center',
    },
    backBtn: {
        position: 'absolute',
        left: 24,
    },
})

export default Heading
