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
import { CssBaseline, AppBar, Toolbar } from '@material-ui/core';
import Button from '@material-ui/core/Button'
import BookingPanel from './BookingPanel';

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
    }
}))

const BookingsPage = props => {

    const classes = useStyles()

    const { firebase, width } = props

    const [bookings, setBookings] = useState(null)
    const [selectedDate, setSelectedDate] = useState(new Date())

    useEffect(() => {
        const values = queryString.parse(props.location.search)
        if (values.id) {
            fetchBooking(values.id)
        } else {
            fetchBookingsByDate(new Date())
        }
    }, [])

    const handleDateChange = date => {
        setSelectedDate(date)
        fetchBookingsByDate(date)
    }

    const handleLogout = () => {
        firebase.doSignOut()
    }

    const fetchBooking = id => {
        firebase.db.collection('bookings').doc(id)
            .get().then(documentSnapshot => {
                setBookings([documentSnapshot])
                setSelectedDate(documentSnapshot.get('dateTime').toDate())
            })
    }

    const fetchBookingsByDate = date => {
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
                            value={selectedDate}
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
                                    value={selectedDate}
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
                    <Typography variant="subtitle1">Current width: {width}</Typography>
                    <Grid item xs sm>
                        {bookings ? bookings.map((booking, index) => (
                            <BookingPanel key={booking.id} booking={booking} />
                            // <li key={index}>
                            //     {booking.id}
                            //     {JSON.stringify(booking.data())}
                            // </li>
                        )) : null}
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