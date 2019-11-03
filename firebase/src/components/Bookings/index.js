import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withAuthorization } from '../Session';
import DateFnsUtils from '@date-io/date-fns';
import queryString from 'query-string'
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import withWidth from '@material-ui/core/withWidth';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer'
import { compose } from 'recompose';
import CssBaseline from '@material-ui/core/CssBaseline'
import AppBar from '@material-ui/core/AppBar'
import Button from '@material-ui/core/Button'
import Toolbar from '@material-ui/core/Toolbar'
import Divider from '@material-ui/core/Divider'
import LinearProgress from '@material-ui/core/LinearProgress';
import BookingPanel from './BookingPanel';
import LocationBookings from './LocationBookings'
import LocationCheckboxes from './LocationCheckboxes';
import NavigateBefore from '@material-ui/icons/NavigateBefore'
import NavigateNext from '@material-ui/icons/NavigateNext'
import DateNav from './BookingsNav';

const dateFormat = require('dateformat')

const drawerWidth = 320

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex'
    },
    list: {
        padding: theme.spacing(1),
        margin: theme.spacing(1)
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
        zIndex: theme.zIndex.drawer + 1
    },
    toolbar: theme.mixins.toolbar,
    title: {
        flexGrow: 1
    },
    location: {
        paddingBottom: '100px'
    }
}))

const BookingsPage = props => {

    const classes = useStyles()

    const { firebase, width } = props

    const [bookings, setBookings] = useState([])
    const [date, setDate] = useState(new Date())
    const [loading, setLoading] = useState(true)
    const [selectedLocations, setSelectedLocations] = useState({
        balwyn: true,
        malvern: true,
        mobile: true
    })

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

    const handleLocationChange = name => e => {
        setSelectedLocations({ ...selectedLocations, [name]: e.target.checked})
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
        var timeout = setTimeout(() => {
            setLoading(true)
        }, 750)
        
        date.setHours(0,0,0,0)
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
                clearTimeout(timeout)
                setLoading(false)
            })
    }

    return (
        <div className={classes.root}>
            <CssBaseline />
            <AppBar className={classes.appBar} position="fixed">
                <Toolbar>
                    <Typography variant="h6" className={classes.title}>
                        Party Bookings
                    </Typography>
                    <Button color="inherit" onClick={handleLogout}>Logout</Button>
                </Toolbar>
            </AppBar>
            <Hidden xsDown>
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
                                'aria-lavel': 'change date'
                            }}
                        />                       
                    </MuiPickersUtilsProvider>
                </Drawer>
            </Hidden>
            <Grid container spacing={3}>
            <main className={classes.content}>
                <Hidden smUp>
                    <Grid item xs sm>
                        <div className={classes.toolbar}/>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <KeyboardDatePicker
                                    disableToolbar
                                    variant="inline"
                                    format="dd/MM/yyyy"
                                    margin="normal"
                                    id="date-picker"
                                    label="Date picker"
                                    autoOk="true"
                                    value={date}
                                    onChange={handleDateChange}
                                    KeyboardButtonProps={{
                                        'aria-lavel': 'change date'
                                    }}
                                />                       
                            </MuiPickersUtilsProvider>
                    </Grid>
                </Hidden>
                <Hidden xsDown>
                    <div className={classes.toolbar} />
                    </Hidden>
                    <DateNav
                        onNavigateBefore={handleNavigateBefore}
                        onNavigateNext={handleNavigateNext}
                        date={date}
                    />
                    {loading && <LinearProgress />}
                    <LocationCheckboxes values={selectedLocations} handleChange={handleLocationChange} />
                    <Divider />
                    <Grid item xs sm>
                        {selectedLocations.balwyn && <LocationBookings bookings={bookings} location="balwyn" />}
                        {selectedLocations.malvern && <LocationBookings bookings={bookings} location="malvern" />}
                        {selectedLocations.mobile && <LocationBookings bookings={bookings} location="mobile" />}
                    </Grid>
                </main>
                </Grid>
            
        </div>
    )
}

BookingsPage.propTypes = {
    width: PropTypes.oneOf(['lg', 'md', 'sm', 'xl', 'xs']).isRequired,
};
  
export default compose(
    withAuthorization,
    withWidth()
)(BookingsPage)