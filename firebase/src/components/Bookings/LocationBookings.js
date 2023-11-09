import React from 'react'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import BookingPanel from './BookingPanel'
import * as Utilities from '../../utilities/stringUtilities'

const PREFIX = 'LocationBookings'

const classes = {
    root: `${PREFIX}-root`,
    heading: `${PREFIX}-heading`,
}

const Root = styled('div')(({ theme }) => ({
    [`&.${classes.root}`]: {
        paddingTop: theme.spacing(2),
    },

    [`& .${classes.heading}`]: {
        paddingBottom: theme.spacing(1),
    },
}))

const LocationBookings = (props) => {
    const { bookings, location } = props

    return (
        <Root className={classes.root}>
            <Typography className={classes.heading} variant="h6">
                {Utilities.capitalise(location)}
            </Typography>
            {bookings.length > 0 ? (
                bookings.map((booking) => <BookingPanel key={booking.id} bookingId={booking.id} booking={booking} />)
            ) : (
                <Typography variant="overline">No parties</Typography>
            )}
        </Root>
    )
}

export default LocationBookings
