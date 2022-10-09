import React from 'react'
import { useHistory } from 'react-router-dom'
import { AppBar, CssBaseline, IconButton, makeStyles, Toolbar, Typography } from '@material-ui/core'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import { DateTime } from 'luxon'

type Props = {
    time: string
}

const Heading: React.FC<Props> = ({ time }) => {
    const classes = useStyles()
    const history = useHistory()

    const formattedClass = DateTime.fromISO(time).toLocaleString({
        weekday: 'short',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    })

    return (
        <>
            <CssBaseline />
            <AppBar className={classes.appBar} position="static">
                <Toolbar className={classes.toolbar}>
                    <div className={classes.nav}>
                        <IconButton edge="start" color="inherit" onClick={() => history.goBack()}>
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography variant="h6" color="inherit">
                            Children
                        </Typography>
                    </div>
                    <Typography variant="h6" color="inherit">
                        {formattedClass}
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
    toolbar: {
        display: 'flex',
        justifyContent: 'center',
    },
    nav: {
        display: 'flex',
        alignItems: 'center',
        position: 'absolute',
        left: 24,
    },
    calendarName: {
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 10,
    },
}))

export default Heading
