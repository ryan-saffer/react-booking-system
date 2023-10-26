import React from 'react'
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom'
import { AppBar, CssBaseline, IconButton, Toolbar, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { DateTime } from 'luxon'

const PREFIX = 'Heading';

const classes = {
    appBar: `${PREFIX}-appBar`,
    toolbar: `${PREFIX}-toolbar`,
    nav: `${PREFIX}-nav`,
    calendarName: `${PREFIX}-calendarName`
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.appBar}`]: {
        zIndex: theme.zIndex.drawer + 1,
    },

    [`& .${classes.toolbar}`]: {
        display: 'flex',
        justifyContent: 'center',
    },

    [`& .${classes.nav}`]: {
        display: 'flex',
        alignItems: 'center',
        position: 'absolute',
        left: 24,
    },

    [`& .${classes.calendarName}`]: {
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 10,
    }
}));

type Props = {
    time: string
}

const Heading: React.FC<Props> = ({ time }) => {

    const navigate = useNavigate()
    const formattedClass = DateTime.fromISO(time).toLocaleString({
        weekday: 'short',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    })

    return (
        <Root>
            <CssBaseline />
            <AppBar className={classes.appBar} position="static">
                <Toolbar className={classes.toolbar}>
                    <div className={classes.nav}>
                        <IconButton edge="start" color="inherit" onClick={() => navigate(-1)} size="large">
                            <ArrowBackIcon />
                        </IconButton>
                    </div>
                    <Typography variant="h6" color="inherit">
                        {formattedClass}
                    </Typography>
                </Toolbar>
            </AppBar>
        </Root>
    );
}

export default Heading
