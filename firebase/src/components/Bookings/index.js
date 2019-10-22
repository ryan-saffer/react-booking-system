import React, { useState, useEffect } from 'react';
import { withFirebase } from '../Firebase/context';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

const BookingsPage = props => {

    const { firebase } = props

    const [bookings, setBookings] = useState(null)
    const [selectedDate, setSelectedDate] = useState(new Date())

    const handleDateChange = date => {
        setSelectedDate(date)
        fetchBookings(date)
    }

    const fetchBookings = date => {
        date.setHours(0,0,0,0)
        var nextDay = new Date(date.getTime())
        nextDay.setDate(nextDay.getDate() + 1)
        
        firebase.db.collection('bookings')
            .where('dateTime', '>', date)
            .where('dateTime', '<', nextDay)
            .get().then(querySnapshot => {
                var latestBookings = []
                querySnapshot.forEach(documentSnapshot => {
                    latestBookings.push(documentSnapshot.data())
                })
                setBookings(latestBookings)
            })
    }

    useEffect(() => {
        fetchBookings(new Date())
    }, [])
    

    return (
        <>
            <div>
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
            </div>
            {
                bookings
                    ? <MatchingBookings bookings={bookings} />
                    : null
            }
        </>
    )

}

const MatchingBookings = props => {
    return (
        <ul>
            {props.bookings.map((booking, index) => (
                <li key={index}>{JSON.stringify(booking)}</li>
            ))}
        </ul>
    )
}

export default withFirebase(BookingsPage)