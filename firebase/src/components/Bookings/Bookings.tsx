import { Location, ObjectKeys } from 'fizz-kidz'
import { useState } from 'react'

import { Checkbox, Divider, FormControlLabel, FormGroup, Grid, useMediaQuery } from '@mui/material'

import { DateNavigation } from './DateNavigation/DateNavigation'
import Events from './Events/Events'
import { useEvents } from './Events/UseEvents'
import LocationBookings from './LocationBookings'
import LocationCheckboxes from './LocationCheckboxes'
import NewBookingDialog from './NewBookingDialog'
import { usePartyBookings } from './usePartyBookings'

export const BookingsPage = () => {
    const [openNewBooking, setOpenNewBooking] = useState(false)
    return (
        <>
            <DateNavigation
                label="Party Bookings"
                showButton
                buttonLabel="New Booking"
                onButtonPressed={() => setOpenNewBooking(true)}
            >
                <Bookings />
                <NewBookingDialog open={openNewBooking} onBookingCreated={() => setOpenNewBooking(false)} />
            </DateNavigation>
        </>
    )
}

const Bookings = () => {
    const [selectedLocations, setSelectedLocations] = useState(
        ObjectKeys(Location).reduce<{ [key in Location]?: boolean }>(
            (acc, curr) => ({ ...acc, [Location[curr]]: true }),
            {}
        )
    )
    const [eventsChecked, setEventsChecked] = useState(true)

    const bookings = usePartyBookings({ setSelectedLocations, setEventsChecked })
    const events = useEvents()

    const handleLocationChange = (location: Location, checked: boolean) => {
        setSelectedLocations({ ...selectedLocations, [location]: checked })
    }

    const isMobile = useMediaQuery('(max-width: 460px)')

    return (
        <>
            <FormGroup row sx={{ gap: 1 }}>
                <LocationCheckboxes values={selectedLocations} handleChange={handleLocationChange} />
                <FormControlLabel
                    control={
                        <Checkbox
                            size={isMobile ? 'small' : 'medium'}
                            checked={eventsChecked}
                            onChange={() => setEventsChecked((it) => !it)}
                            color="secondary"
                        />
                    }
                    label="Events"
                />
            </FormGroup>
            <Divider />
            <Grid item xs sm md>
                {Object.values(Location).map(
                    (location) =>
                        selectedLocations[location] && (
                            <LocationBookings
                                key={location}
                                bookings={bookings.filter((it) => it.location === location)}
                                location={location}
                            />
                        )
                )}
                {eventsChecked && <Events events={events} />}
            </Grid>
        </>
    )
}
