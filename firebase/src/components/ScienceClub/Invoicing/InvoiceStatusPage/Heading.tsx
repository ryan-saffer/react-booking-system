import React from 'react'
import { AppBar, CssBaseline, IconButton, makeStyles, Toolbar, Typography } from '@material-ui/core'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import { useNavigate } from 'react-router-dom'

const Heading: React.FC = () => {
    const navigate = useNavigate()
    const classes = useStyles()
    return (
        <>
            <CssBaseline />
            <AppBar position="static">
                <Toolbar className={classes.toolbar}>
                    <IconButton className={classes.backBtn} edge="start" color="inherit" onClick={() => navigate(-1)}>
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
