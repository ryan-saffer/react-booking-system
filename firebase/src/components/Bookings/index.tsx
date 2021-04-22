import React, { useState, useEffect, useContext, ReactElement, Ref } from 'react';
import { useHistory, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import {
    Paper, Grid, Hidden, Typography, makeStyles, Drawer, CssBaseline, AppBar,
    Button, Toolbar, Divider, LinearProgress, IconButton, Dialog, Slide
} from '@material-ui/core';
import { ExitToApp as ExitToAppIcon, Close as CloseIcon } from '@material-ui/icons';
import { grey } from '@material-ui/core/colors'

import { withAuthorization } from '../Session';
import NewBookingForm from './Forms/NewBookingForm'
import { Locations } from 'fizz-kidz'
import * as ROUTES from '../../constants/routes'
import LocationBookings from './LocationBookings'
import LocationCheckboxes from './LocationCheckboxes';
import DateNav from './BookingsNav';
import * as Logo from '../../drawables/FizzKidzLogoHorizontal.png'
import useAdmin from '../Hooks/UseAdmin';
import { TransitionProps } from '@material-ui/core/transitions';
import Firebase, { FirebaseContext } from '../Firebase';
import useQueryParam from '../Hooks/UseQueryParam';
import firebase from 'firebase';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';

interface QueryParams {
    id: string
}

const Transition = React.forwardRef((
    props: TransitionProps & { children?: ReactElement<any, any> },
    ref: Ref<unknown>
) => (
    <Slide direction="up" ref={ref} {...props} />
))

const BookingsPage = () => {

    const classes = useStyles()

    const firebase = useContext(FirebaseContext) as Firebase

    const isAdmin = useAdmin()

    const [bookings, setBookings] = useState<firebase.firestore.DocumentSnapshot[]>([])
    const [date, setDate] = useState(new Date())
    const [loading, setLoading] = useState(true)
    let initialLocations: { [key in Locations]?: boolean } = {}
    Object.values(Locations).forEach(location => initialLocations[location] = true)
    const [selectedLocations, setSelectedLocations] = useState(initialLocations)

    const [openNewBooking, setOpenNewBooking] = useState(false)
    // used to ensure form mounts on each open. See https://github.com/reactjs/react-modal/issues/106#issuecomment-546658885
    const [key, setKey] = useState(0)
    const id = useQueryParam<QueryParams>('id')

    let history = useHistory()

    useEffect(() => {
        if (id) {
            fetchBooking(id)
        } else {
            fetchBookingsByDate(new Date())
        }
    }, [])

    const handleDateChange = (date: Date) => {
        setDate(date)
        fetchBookingsByDate(date)
    }

    const handleNavigateBefore = () => {
        var dayBefore = date
        dayBefore.setDate(dayBefore.getDate() - 1)
        setDate(dayBefore)
        fetchBookingsByDate(dayBefore)
    }

    const handleNavigateNext = () => {
        var tomorrow = date
        tomorrow.setDate(tomorrow.getDate() + 1)
        setDate(tomorrow)
        fetchBookingsByDate(tomorrow)
    }

    const handleLogout = () => {
        firebase.doSignOut()
    }

    const handleOpenNewBooking = () => {
        setOpenNewBooking(true)
    }

    const handleCloseBooking = (date?: Date) => {
        console.log(date)
        if (date instanceof Date) {
            setDate(date)
            fetchBookingsByDate(date)
        }
        setKey(key + 1)
        setOpenNewBooking(false)
    }

    const handleLocationChange = (name: any) => (e: any) => {
        setSelectedLocations({ ...selectedLocations, [name]: e.target.checked })
    }

    const fetchBooking = (id: any) => {
        setLoading(true)
        firebase.db.collection('bookings').doc(id)
            .get().then(documentSnapshot => {
                setBookings([documentSnapshot])
                setDate(documentSnapshot.get('dateTime').toDate())
                let selectedLocations: { [key in Locations]?: boolean} = {}
                Object.values(Locations).forEach(location => selectedLocations[location] = false)
                selectedLocations[documentSnapshot.get('location') as Locations] = true
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
        
        firebase.db.collection('bookings')
            .where('dateTime', '>', date)
            .where('dateTime', '<', nextDay)
            .get().then(querySnapshot => {
                var latestBookings: firebase.firestore.DocumentSnapshot[] = []
                querySnapshot.forEach(documentSnapshot => {
                    latestBookings.push(documentSnapshot)
                })
                setBookings(latestBookings)
                setLoading(false)
            })
    }

    return (
        <div className={classes.root}>
            <CssBaseline />
            <AppBar className={classes.appBar} position="fixed">
                <Toolbar className={classes.appBarToolbar}>
                    <div className={classes.topLeft}>
                        <Typography variant="h6">
                            Party Bookings
                        </Typography>
                    </div>
                    <div className={classes.topCenter}>
                        <img
                            className={classes.logo}
                            src={Logo.default}
                            onClick={() => history.push(ROUTES.LANDING)} />
                    </div>
                    <div className={isAdmin ? classes.authTopRight : classes.noAuthTopRight}>
                        {isAdmin && <Button className={classes.newBookingButton} color="inherit" onClick={handleOpenNewBooking}>New Booking</Button>}
                        <IconButton
                            className={classes.logoutIcon}
                            onClick={handleLogout}>
                            <ExitToAppIcon htmlColor={'white'} />
                        </IconButton>
                    </div>
                </Toolbar>
            </AppBar>
            {/* New Booking Dialogue */}
            <Dialog
                fullScreen
                open={openNewBooking}
                onClose={() => handleCloseBooking()}
                TransitionComponent={Transition}
                disableAutoFocus={true}
                PaperProps={{ classes: { root: classes.dialog } }}
            >
            <CssBaseline />
            <AppBar position='absolute' className={classes.dialogueAppBar}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={() => handleCloseBooking()} aria-label="close">
                        <CloseIcon />
                    </IconButton>
                    <Typography variant="h6">
                        New Booking
                    </Typography>
                </Toolbar>
            </AppBar>
            <main key={key} className={classes.layout}>
                <Paper className={classes.paper}>
                    <NewBookingForm onSuccess={handleCloseBooking} />
                </Paper>
            </main>
            </Dialog>
            {/* End New Bookings Dialogue */}
            <Hidden smDown>
                <Drawer
                    className={classes.drawer}
                    variant="permanent"
                    classes={{
                        paper: classes.drawerPaper,
                    }}
                    anchor="left"
                >
                    <div className={classes.toolbar} />
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <KeyboardDatePicker
                            disableToolbar
                            variant="static"
                            format="dd/MM/yyyy"
                            margin="normal"
                            id="date-picker"
                            label="Date picker"
                            autoOk={true}
                            value={date}
                            onChange={date => handleDateChange(new Date(date?.toISOString() ?? ""))}
                            KeyboardButtonProps={{
                                'aria-label': 'change date'
                            }}
                        />                       
                    </MuiPickersUtilsProvider>
                </Drawer>
            </Hidden>
            <Grid container >
            <main className={classes.content}>
                <Hidden mdUp>
                    <Grid item xs sm md>
                            <div className={classes.toolbar} />
                            <div className={classes.inlineDatePicker}>
                                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <KeyboardDatePicker
                                    disableToolbar
                                    variant="inline"
                                    inputVariant="outlined"
                                    format="dd/MM/yyyy"
                                    margin="normal"
                                    id="date-picker"
                                    label="Date picker"
                                    autoOk={true}
                                    value={date}
                                    onChange={date => handleDateChange(new Date(date?.toISOString() ?? ""))}
                                    KeyboardButtonProps={{
                                        'aria-label': 'change date'
                                    }}
                                />                       
                                </MuiPickersUtilsProvider>
                            </div>
                            <div className={classes.divider}>
                                <Divider />
                            </div>
                    </Grid>
                </Hidden>
                <Hidden smDown>
                    <div className={classes.toolbar} />
                </Hidden>
                <DateNav
                    onNavigateBefore={handleNavigateBefore}
                    onNavigateNext={handleNavigateNext}
                    date={date}
                />
                {loading && <LinearProgress color="secondary" />}
                <LocationCheckboxes values={selectedLocations} handleChange={handleLocationChange} />
                <Divider />
                <Grid item xs sm md>
                    {Object.values(Locations).map(location =>
                        selectedLocations[location] && <LocationBookings key={location} onSuccess={handleCloseBooking} bookings={bookings} location={location} />
                    )}
                </Grid>
            </main>
            </Grid>
        </div>
    )
}

const drawerWidth = 320

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex'
    },
    drawer: {
        width: drawerWidth,
        flexShrink: 0,
    },
    drawerPaper: {
        width: drawerWidth,
    },
    content: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing(3)
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
        color: 'white',
    },
    appBarToolbar: {
        display: 'flex',
        '@media (max-width: 550px)': {
            justifyContent: 'space-around'
        }
    },
    logo: {
        height: 50,
        cursor: 'pointer'
    },
    topLeft: {
        width: '33.3%',
        display: 'flex',
        justifyContent: 'flex-start',
        '@media (max-width: 550px)': {
            display: 'none'
        }
    },
    topCenter: {
        width: '33.3%',
        display: 'flex',
        justifyContent: 'center'
    },
    authTopRight: {
        width: '33.3%',
        display: 'flex',
        justifyContent: 'flex-end',
        '@media (max-width: 550px)': {
            width: 'auto'
        }
    },
    noAuthTopRight: {
        width: '33.3%',
        display: 'flex',
        justifyContent: 'flex-end',
        '@media (max-width: 550px)': {
            display: 'none'
        }
    },
    newBookingButton: {
        borderColor: 'white',
        borderStyle: 'solid',
        borderWidth: 'thin'
    },
    logoutIcon: {
        paddingTop: theme.spacing(1),
        paddingRight: '0px',
        paddingBottom: theme.spacing(1),
        paddingLeft: theme.spacing(2),
        '@media (max-width: 550px)': {
            display: 'none'
        }
    },
    toolbar: theme.mixins.toolbar,
    inlineDatePicker: {
        marginTop: -20,
        textAlign: 'center'
    },
    location: {
        paddingBottom: '100px'
    },
    dialogueAppBar: {
        position: 'relative'
    },
    divider: {
        marginBottom: 5
    },
    paper: {
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(3),
        padding: theme.spacing(2),
        [theme.breakpoints.up(800 + theme.spacing(3) * 2)]: {
            marginTop: theme.spacing(6),
            marginBottom: theme.spacing(6),
            padding: theme.spacing(3),
        },
    },
    layout: {
        width: 'auto',
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(2),
        [theme.breakpoints.up(800 + theme.spacing(2) * 2)]: {
          width: 800,
          marginLeft: 'auto',
          marginRight: 'auto',
        },
    },
    dialog: {
        backgroundColor: grey[200]
    }
}))
  
export default compose(
    withAuthorization,
    withRouter
)(BookingsPage)