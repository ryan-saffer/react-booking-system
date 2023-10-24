import React, { useState, useEffect, useContext } from 'react'
import { styled } from '@mui/material/styles'
import { useNavigate } from 'react-router-dom'
import {
    Grid,
    Hidden,
    Typography,
    Drawer,
    CssBaseline,
    AppBar,
    Button,
    Toolbar,
    Divider,
    LinearProgress,
    IconButton,
    FormControlLabel,
    Checkbox,
    FormGroup,
    Box,
} from '@mui/material'
import { ExitToApp as ExitToAppIcon } from '@mui/icons-material'
import { grey } from '@mui/material/colors'

import { Location } from 'fizz-kidz'
import * as ROUTES from '../../constants/routes'
import LocationBookings from './LocationBookings'
import LocationCheckboxes from './LocationCheckboxes'
import DateNav from './BookingsNav'
import * as Logo from '../../drawables/FizzKidzLogoHorizontal.png'
import Firebase, { FirebaseContext } from '../Firebase'
import firebase from 'firebase/compat'
import NewBookingDialog from './NewBookingDialog'
import { useEvents } from './Events/UseEvents'
import Events from './Events/Events'
import { useScopes } from '../Hooks/UseScopes'
import { StaticDatePicker } from '@mui/x-date-pickers'
import { DateTime } from 'luxon'

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
    linearProgressHidden: `${PREFIX}-linearProgressHidden`,
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

    [`& .${classes.inlineDatePicker}`]: {
        // marginTop: -20,
        textAlign: 'center',
    },

    [`& .${classes.location}`]: {
        paddingBottom: '100px',
    },

    [`& .${classes.dialogueAppBar}`]: {
        position: 'relative',
    },

    [`& .${classes.divider}`]: {
        marginBottom: 5,
    },

    [`& .${classes.paper}`]: {
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(3),
        padding: theme.spacing(2),
        [theme.breakpoints.up(800 + parseInt(theme.spacing(3).substring(-2)) * 2)]: {
            marginTop: theme.spacing(6),
            marginBottom: theme.spacing(6),
            padding: theme.spacing(3),
        },
    },

    [`& .${classes.layout}`]: {
        width: 'auto',
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(2),
        [theme.breakpoints.up(800 + parseInt(theme.spacing(2).substring(-2)) * 2)]: {
            width: 800,
            marginLeft: 'auto',
            marginRight: 'auto',
        },
    },

    [`& .${classes.dialog}`]: {
        backgroundColor: grey[200],
    },

    [`& .${classes.linearProgressHidden}`]: {
        visibility: 'hidden',
    },
}))

export const BookingsPage = () => {
    const firebase = useContext(FirebaseContext) as Firebase

    const scopes = useScopes()
    const writePermissions = scopes.CORE === 'write'

    const [bookings, setBookings] = useState<firebase.firestore.DocumentSnapshot[]>([])
    const [events, setEventsDate] = useEvents()
    const [date, setDate] = useState(DateTime.now())
    const [loading, setLoading] = useState(true)
    let initialLocations: { [key in Location]?: boolean } = {}
    Object.values(Location).forEach((location) => (initialLocations[location] = true))
    const [selectedLocations, setSelectedLocations] = useState(initialLocations)
    const [eventsChecked, setEventsChecked] = useState(true)

    const [openNewBooking, setOpenNewBooking] = useState(false)
    const urlSearchParams = new URLSearchParams(window.location.search)
    const id = urlSearchParams.get('id')

    const navigate = useNavigate()

    useEffect(() => {
        if (id) {
            fetchBooking(id)
        } else {
            fetchBookingsByDate(new Date())
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleDateChange = (date: DateTime) => {
        setDate(date)
        fetchBookingsByDate(date.toJSDate())
        setEventsDate(date.toJSDate())
    }

    const handleLogout = () => {
        firebase.doSignOut()
    }

    const handleOpenNewBooking = () => {
        setOpenNewBooking(true)
    }

    const handleCloseBooking = (date?: Date) => {
        if (date instanceof Date) {
            setDate(DateTime.fromJSDate(date))
            fetchBookingsByDate(date)
            setEventsDate(date)
        }
        setOpenNewBooking(false)
    }

    const handleLocationChange = (name: any) => (e: any) => {
        setSelectedLocations({ ...selectedLocations, [name]: e.target.checked })
    }

    const fetchBooking = (id: any) => {
        setLoading(true)
        firebase.db
            .collection('bookings')
            .doc(id)
            .get()
            .then((documentSnapshot) => {
                setBookings([documentSnapshot])
                setDate(documentSnapshot.get('dateTime').toDate())
                let selectedLocations: { [key in Location]?: boolean } = {}
                Object.values(Location).forEach((location) => (selectedLocations[location] = false))
                selectedLocations[documentSnapshot.get('location') as Location] = true
                setSelectedLocations(selectedLocations)
            })
        setLoading(false)
    }

    const fetchBookingsByDate = (date: Date) => {
        // only show loading indicator if taking a while
        setLoading(true)

        date.setHours(0, 0, 0, 0)
        var nextDay = new Date(date.getTime())
        nextDay.setDate(nextDay.getDate() + 1)

        firebase.db
            .collection('bookings')
            .where('dateTime', '>', date)
            .where('dateTime', '<', nextDay)
            .get()
            .then((querySnapshot) => {
                var latestBookings: firebase.firestore.DocumentSnapshot[] = []
                querySnapshot.forEach((documentSnapshot) => {
                    latestBookings.push(documentSnapshot)
                })
                setBookings(latestBookings)
                setLoading(false)
            })
    }

    return (
        <Root className={classes.root}>
            <CssBaseline />
            <AppBar className={classes.appBar} position="fixed">
                <Toolbar className={classes.appBarToolbar}>
                    <div className={classes.topLeft}>
                        <Typography variant="h6" color="inherit">
                            Party Bookings
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
                        {writePermissions && (
                            <Button
                                onClick={handleOpenNewBooking}
                                variant="outlined"
                                sx={{
                                    color: 'white',
                                    borderColor: 'white',
                                    '&:hover': { borderColor: 'white', background: grey[800] },
                                }}
                            >
                                New Booking
                            </Button>
                        )}
                        <IconButton className={classes.logoutIcon} onClick={handleLogout} size="large">
                            <ExitToAppIcon htmlColor={'white'} />
                        </IconButton>
                    </div>
                </Toolbar>
            </AppBar>
            <NewBookingDialog open={openNewBooking} onBookingCreated={handleCloseBooking} />
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
                    <DateNav date={date} handleDateChange={handleDateChange} />
                    <LinearProgress className={loading ? '' : classes.linearProgressHidden} color="secondary" />
                    <FormGroup row sx={{ padding: 1, gap: 1 }}>
                        <LocationCheckboxes values={selectedLocations} handleChange={handleLocationChange} />
                        <FormControlLabel
                            sx={{ gap: 1 }}
                            control={
                                <Checkbox
                                    checked={eventsChecked}
                                    onChange={() => setEventsChecked((it) => !it)}
                                    color="secondary"
                                />
                            }
                            label="Events"
                        />
                    </FormGroup>
                    <Divider />
                    <Grid item xs sm md>
                        {Object.values(Location).map(
                            (location) =>
                                selectedLocations[location] && (
                                    <LocationBookings
                                        key={location}
                                        onSuccess={handleCloseBooking}
                                        bookings={bookings}
                                        location={location}
                                    />
                                )
                        )}
                        {eventsChecked && <Events events={events} onDeleteEvent={handleCloseBooking} />}
                    </Grid>
                </Box>
            </Grid>
        </Root>
    )
}

const drawerWidth = 320
