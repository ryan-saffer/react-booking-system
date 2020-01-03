import React from 'react'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import BookingPanel from './BookingPanel'

const useStyles = makeStyles(theme => ({
    root: {
        paddingTop: theme.spacing(2)
    },
    heading: {
        paddingBottom: theme.spacing(1)
    }
}))
    
const LocationBookings = props => {

    const classes = useStyles()

    const { bookings, location } = props

    const filteredBookings = bookings.filter(x => x.data().location === location)

    return (
        <div className={classes.root}>
            <Typography className={classes.heading} variant="h6">{location.charAt(0).toUpperCase() + location.slice(1)}</Typography>
            {filteredBookings.length > 0 ? (
                filteredBookings.map(booking => <BookingPanel key={booking.id} booking={booking.data()} />)
            ) : (
                    <Typography variant="overline">No bookings</Typography>
            )}
        </div>
    )
}

export default LocationBookings