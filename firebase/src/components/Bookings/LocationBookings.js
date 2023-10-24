import React, { useMemo } from 'react'
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

    const filteredBookings = useMemo(() => bookings.filter((x) => x.data().location === location), [bookings, location])

    return (
        <Root className={classes.root}>
            <Typography className={classes.heading} variant="h6">
                {Utilities.capitalise(location)}
            </Typography>
            {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                    <BookingPanel
                        key={booking.id}
                        onSuccess={props.onSuccess}
                        bookingId={booking.id}
                        booking={booking.data()}
                    />
                ))
            ) : (
                <Typography variant="overline">No parties</Typography>
            )}
        </Root>
    )
}

export default LocationBookings
