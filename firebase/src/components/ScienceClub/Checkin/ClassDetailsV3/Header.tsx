import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { AppBar, CssBaseline, Divider, IconButton, makeStyles, Toolbar, Typography } from '@material-ui/core'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import HelpOutlineIcon from '@material-ui/icons/HelpOutline'

const Heading: React.FC = () => {
    const classes = useStyles()
    const history = useHistory()

    return (
        <>
            <CssBaseline />
            <AppBar className={classes.appBar} position="static">
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={() => history.goBack()}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" color="inherit">
                        Children
                    </Typography>
                </Toolbar>
            </AppBar>
        </>
    )
}

const useStyles = makeStyles((theme) => ({
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
    },
    calendarName: {
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 10,
    },
}))

export default Heading
