import React, { useState, useEffect } from 'react';
import { withFirebase } from '../Firebase/context';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import queryString from 'query-string'

const BookingsPage = props => {

    const { firebase } = props

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
        <>
            <div>
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
            </div>
            <ul>
            {bookings ? bookings.map((booking, index) => (
                <li key={index}>
                    {booking.id}
                    {JSON.stringify(booking.data())}
                </li>
            )) : null}
            </ul>
        </>
    )
}

export default withFirebase(BookingsPage)