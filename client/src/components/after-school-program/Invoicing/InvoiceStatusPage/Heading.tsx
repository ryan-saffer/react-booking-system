import React from 'react'
import { useNavigate } from 'react-router-dom'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { AppBar, CssBaseline, IconButton, Toolbar, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'

const PREFIX = 'Heading'

const classes = {
    toolbar: `${PREFIX}-toolbar`,
    backBtn: `${PREFIX}-backBtn`,
}

const Root = styled('div')({
    [`& .${classes.toolbar}`]: {
        display: 'flex',
        justifyContent: 'center',
    },
    [`& .${classes.backBtn}`]: {
        position: 'absolute',
        left: 24,
    },
})

const Heading: React.FC = () => {
    const navigate = useNavigate()

    return (
        <Root>
            <CssBaseline />
            <AppBar position="static">
                <Toolbar className={classes.toolbar}>
                    <IconButton
                        className={classes.backBtn}
                        edge="start"
                        color="inherit"
                        onClick={() => navigate(-1)}
                        size="large"
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" color="inherit">
                        Science Program Enrolment Dashboard
                    </Typography>
                </Toolbar>
            </AppBar>
        </Root>
    )
}

export default Heading
