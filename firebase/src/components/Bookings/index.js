import React, { useState, useEffect } from 'react';
import { withAuthorization, AuthUserContext } from '../Session';
import DateFnsUtils from '@date-io/date-fns';
import queryString from 'query-string'
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer'
import CssBaseline from '@material-ui/core/CssBaseline'
import AppBar from '@material-ui/core/AppBar'
import Button from '@material-ui/core/Button'
import Toolbar from '@material-ui/core/Toolbar'
import Divider from '@material-ui/core/Divider'
import LinearProgress from '@material-ui/core/LinearProgress';
import LocationBookings from './LocationBookings'
import LocationCheckboxes from './LocationCheckboxes';
import DateNav from './BookingsNav';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import * as Logo from '../../drawables/FizzKidzLogoHorizontal.png'
import { IconButton } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog'
import Slide from '@material-ui/core/Slide'
import CloseIcon from '@material-ui/icons/Close'
import NewBookingForm from '../Forms/NewBookingForm'
import { grey } from '@material-ui/core/colors'
import * as FormValues from '../../constants/FormValues';
import * as ROLES from '../../constants/roles'
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';
import * as ROUTES from '../../constants/routes'

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
        justifyContent: 'center'
    },
    title: {
        marginRight: 'auto',
        paddingLeft: '8px'
    },
    logo: {
        height: 50,
        cursor: 'pointer'
    },
    topRight: {
        marginLeft: 'auto'
    },
    logoutIcon: {
        paddingTop: theme.spacing(1),
        paddingRight: '0px',
        paddingBottom: theme.spacing(1),
        paddingLeft: theme.spacing(1)
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

const Transition = React.forwardRef((props, ref) => (
    <Slide direction="up" ref={ref} {...props} />
))

const BookingsPage = props => {

    const classes = useStyles()

    const { firebase } = props

    const [bookings, setBookings] = useState([])
    const [date, setDate] = useState(new Date())
    const [loading, setLoading] = useState(true)
    var initialLocations = {}
    Object.values(FormValues.Locations).forEach(location => initialLocations[location] = true)
    const [selectedLocations, setSelectedLocations] = useState(initialLocations)

    const [openNewBooking, setOpenNewBooking] = useState(false)
    // used to ensure form mounts on each open. See https://github.com/reactjs/react-modal/issues/106#issuecomment-546658885
    const [key, setKey] = useState(0)

    useEffect(() => {
        const values = queryString.parse(props.location.search)
        if (values.id) {
            fetchBooking(values.id)
        } else {
            fetchBookingsByDate(new Date())
        }
    }, [])

    const handleDateChange = date => {
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

    const handleCloseBooking = date => {
        console.log(date)
        if (date instanceof Date) {
            setDate(date)
            fetchBookingsByDate(date)
        }
        setKey(key + 1)
        setOpenNewBooking(false)
    }

    const handleLocationChange = name => e => {
        setSelectedLocations({ ...selectedLocations, [name]: e.target.checked })
    }

    const fetchBooking = id => {
        setLoading(true)
        firebase.db.collection('bookings').doc(id)
            .get().then(documentSnapshot => {
                setBookings([documentSnapshot])
                setDate(documentSnapshot.get('dateTime').toDate())
            })
        setLoading(false)
    }

    const fetchBookingsByDate = date => {
        // only show loading indicator if taking a while
        setLoading(true)
        
        date.setHours(0, 0, 0, 0)
        var nextDay = new Date(date.getTime())
        nextDay.setDate(nextDay.getDate() + 1)
        
        firebase.db.collection('bookings')
            .where('dateTime', '>', date)
            .where('dateTime', '<', nextDay)
            .get().then(querySnapshot => {
                var latestBookings = []
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
                    <Typography variant="h6" className={classes.title}>
                        Party Bookings
                    </Typography>
                    <img
                        className={classes.logo}
                        src={Logo}
                        onClick={() => props.history.push(ROUTES.LANDING)} />
                    <div className={classes.topRight}>
                        <AuthUserContext.Consumer>
                            {authUser => (
                                authUser.roles[ROLES.ADMIN] && <Button color="inherit" onClick={handleOpenNewBooking}>New Booking</Button>
                            )}
                        </AuthUserContext.Consumer>
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
                onClose={handleCloseBooking}
                TransitionComponent={Transition}
                disableAutoFocus={true}
                PaperProps={{ classes: { root: classes.dialog } }}
            >
            <CssBaseline />
            <AppBar position='absolute' className={classes.dialogueAppBar}>
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={handleCloseBooking} aria-label="close">
                        <CloseIcon />
                    </IconButton>
                    <Typography variant="h6" className={classes.title}>
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
                            autoOk="true"
                            value={date}
                            onChange={handleDateChange}
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
                                    autoOk="true"
                                    value={date}
                                    onChange={handleDateChange}
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
                    {Object.values(FormValues.Locations).map(location =>
                        selectedLocations[location] && <LocationBookings key={location} onSuccess={handleCloseBooking} bookings={bookings} location={location} />
                    )}
                </Grid>
            </main>
            </Grid>
        </div>
    )
}
  
export default compose(
    withAuthorization,
    withRouter
)(BookingsPage)