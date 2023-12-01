import { DateTime } from 'luxon'
import { FC, PropsWithChildren, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ExitToApp as ExitToAppIcon } from '@mui/icons-material'
import NavigateBefore from '@mui/icons-material/NavigateBefore'
import NavigateNext from '@mui/icons-material/NavigateNext'
import { AppBar, Box, Button, CssBaseline, Drawer, Grid, Hidden, IconButton, Toolbar, Typography } from '@mui/material'
import { grey } from '@mui/material/colors'
import { styled } from '@mui/material/styles'
import { DatePicker } from '@mui/x-date-pickers'
import { StaticDatePicker } from '@mui/x-date-pickers'

import * as ROUTES from '../../../constants/routes'
import * as Logo from '../../../drawables/FizzKidzLogoHorizontal.png'
import { useScopes } from '../../Hooks/UseScopes'
import useFirebase from '../../Hooks/context/UseFirebase'
import { DateNavigationContext } from './date-navigation.context'

const PREFIX = 'BookingsPage'

const classes = {
    root: `${PREFIX}-root`,
    drawer: `${PREFIX}-drawer`,
    drawerPaper: `${PREFIX}-drawerPaper`,
    content: `${PREFIX}-content`,
    appBar: `${PREFIX}-appBar`,
    appBarToolbar: `${PREFIX}-appBarToolbar`,
    logo: `${PREFIX}-logo`,
    topLeft: `${PREFIX}-topLeft`,
    topCenter: `${PREFIX}-topCenter`,
    authTopRight: `${PREFIX}-authTopRight`,
    noAuthTopRight: `${PREFIX}-noAuthTopRight`,
    logoutIcon: `${PREFIX}-logoutIcon`,
    toolbar: `${PREFIX}-toolbar`,
    inlineDatePicker: `${PREFIX}-inlineDatePicker`,
    location: `${PREFIX}-location`,
    dialogueAppBar: `${PREFIX}-dialogueAppBar`,
    divider: `${PREFIX}-divider`,
    paper: `${PREFIX}-paper`,
    layout: `${PREFIX}-layout`,
    dialog: `${PREFIX}-dialog`,
}

const Root = styled('div')(({ theme }) => ({
    [`&.${classes.root}`]: {
        display: 'flex',
    },

    [`& .${classes.drawer}`]: {
        width: drawerWidth,
        flexShrink: 0,
    },

    [`& .${classes.drawerPaper}`]: {
        width: drawerWidth,
    },

    [`& .${classes.content}`]: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        // padding: theme.spacing(3),
    },

    [`& .${classes.appBar}`]: {
        zIndex: theme.zIndex.drawer + 1,
        color: 'white',
    },

    [`& .${classes.appBarToolbar}`]: {
        display: 'flex',
        '@media (max-width: 550px)': {
            justifyContent: 'space-around',
        },
    },

    [`& .${classes.logo}`]: {
        height: 50,
        cursor: 'pointer',
    },

    [`& .${classes.topLeft}`]: {
        width: '33.3%',
        display: 'flex',
        justifyContent: 'flex-start',
        '@media (max-width: 550px)': {
            display: 'none',
        },
    },

    [`& .${classes.topCenter}`]: {
        width: '33.3%',
        display: 'flex',
        justifyContent: 'center',
    },

    [`& .${classes.authTopRight}`]: {
        width: '33.3%',
        display: 'flex',
        justifyContent: 'flex-end',
        '@media (max-width: 550px)': {
            width: 'auto',
        },
    },

    [`& .${classes.noAuthTopRight}`]: {
        width: '33.3%',
        display: 'flex',
        justifyContent: 'flex-end',
        '@media (max-width: 550px)': {
            display: 'none',
        },
    },

    [`& .${classes.logoutIcon}`]: {
        paddingTop: theme.spacing(1),
        paddingRight: '0px',
        paddingBottom: theme.spacing(1),
        paddingLeft: theme.spacing(2),
        '@media (max-width: 550px)': {
            display: 'none',
        },
    },

    [`& .${classes.toolbar}`]: theme.mixins.toolbar,
}))

type WithButton = {
    showButton: true
    buttonLabel: string
    onButtonPressed: () => void
}

type WithoutButton = {
    showButton: false
}

type Props = {
    label: string
} & (WithButton | WithoutButton)

function midnight(date: DateTime) {
    return date.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
}

export const DateNavigation: FC<PropsWithChildren<Props>> = (props) => {
    const { label, showButton, children } = props

    const firebase = useFirebase()
    const navigate = useNavigate()
    const scopes = useScopes()
    const writePermissions = scopes.CORE === 'write'

    const [date, setDate] = useState(midnight(DateTime.now()))
    const [, setLoading] = useState(true)

    const handleDateChange = (date: DateTime) => {
        setDate(midnight(date))
    }

    const handleLogout = () => {
        firebase.doSignOut()
    }

    return (
        <Root className={classes.root}>
            <CssBaseline />
            <AppBar className={classes.appBar} position="fixed">
                <Toolbar className={classes.appBarToolbar}>
                    <div className={classes.topLeft}>
                        <Typography variant="h6" color="inherit">
                            {label}
                        </Typography>
                    </div>
                    <div className={classes.topCenter}>
                        <img
                            className={classes.logo}
                            src={Logo.default}
                            onClick={() => navigate(ROUTES.LANDING)}
                            alt="fizz kidz logo"
                        />
                    </div>
                    <div className={writePermissions ? classes.authTopRight : classes.noAuthTopRight}>
                        {writePermissions && showButton && (
                            <Button
                                onClick={props.onButtonPressed}
                                variant="outlined"
                                sx={{
                                    color: 'white',
                                    borderColor: 'white',
                                    '&:hover': { borderColor: 'white', background: grey[800] },
                                }}
                            >
                                {props.buttonLabel}
                            </Button>
                        )}
                        <IconButton className={classes.logoutIcon} onClick={handleLogout} size="large">
                            <ExitToAppIcon htmlColor={'white'} />
                        </IconButton>
                    </div>
                </Toolbar>
            </AppBar>
            <Hidden mdDown>
                <Drawer
                    className={classes.drawer}
                    variant="permanent"
                    classes={{
                        paper: classes.drawerPaper,
                    }}
                    anchor="left"
                >
                    <div className={classes.toolbar} />
                    <StaticDatePicker
                        value={date}
                        slotProps={{ actionBar: { actions: ['today'] } }}
                        onChange={(date) => handleDateChange(date!)}
                    />
                </Drawer>
            </Hidden>
            <Grid container sx={{ marginTop: { xs: 7, sm: 8 } }}>
                <Box className={classes.content} sx={{ padding: { xs: 2, md: 3 } }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Button onClick={() => handleDateChange(date.minus({ days: 1 }))}>
                            <NavigateBefore />
                        </Button>
                        <DatePicker
                            closeOnSelect
                            value={date}
                            slotProps={{
                                textField: { sx: { input: { textAlign: 'center' } }, fullWidth: true },
                                actionBar: { actions: ['today'] },
                            }}
                            format="ccc, LLL d, y"
                            onChange={(date) => date && handleDateChange(date)}
                        />
                        <Button onClick={() => handleDateChange(date.plus({ days: 1 }))}>
                            <NavigateNext />
                        </Button>
                    </div>
                    <DateNavigationContext.Provider value={{ date, setDate: handleDateChange, setLoading }}>
                        {children}
                    </DateNavigationContext.Provider>
                </Box>
            </Grid>
        </Root>
    )
}

const drawerWidth = 320
