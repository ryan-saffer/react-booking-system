import { FirestoreBooking, Location, WithId } from 'fizz-kidz'

import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import * as Utilities from '@utils/stringUtilities'

import BookingPanel from './BookingPanel'

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

const LocationBookings = ({ bookings, location }: { bookings: WithId<FirestoreBooking>[]; location: Location }) => {
    return (
        <Root className={classes.root}>
            <Typography className={classes.heading} variant="h6">
                {Utilities.capitalise(location)}
            </Typography>
            {bookings.length > 0 ? (
                bookings.map((booking) => <BookingPanel key={booking.id} booking={booking} />)
            ) : (
                <Typography variant="overline">No parties</Typography>
            )}
        </Root>
    )
}

export default LocationBookings