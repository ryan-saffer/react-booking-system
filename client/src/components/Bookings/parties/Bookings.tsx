import { Location, ObjectKeys } from 'fizz-kidz'
import { useState } from 'react'

import { Grid } from '@mui/material'

import NewBookingDialog from '../shared/NewBookingDialog'
import { DateNavigation } from '../date-navigation/date-navigation'
import LocationBookings from './LocationBookings'
import LocationCheckboxes from './LocationCheckboxes'
import BookingsSwitcher from '../shared/booking-switcher'
import { usePartyBookings } from './usePartyBookings'

export const BookingsPage = () => {
    const [openNewBooking, setOpenNewBooking] = useState(false)
    return (
        <>
            <DateNavigation
                label="Parties, Events & Incursions"
                showButton
                buttonLabel="New Booking"
                onButtonPressed={() => setOpenNewBooking(true)}
            >
                <BookingsSwitcher />
                <NewBookingDialog open={openNewBooking} onBookingCreated={() => setOpenNewBooking(false)} />
            </DateNavigation>
        </>
    )
}

export const Bookings = () => {
    const [selectedLocations, setSelectedLocations] = useState(
        ObjectKeys(Location).reduce<{ [key in Location]?: boolean }>(
            (acc, curr) => ({ ...acc, [Location[curr]]: true }),
            {}
        )
    )
    const bookings = usePartyBookings({ setSelectedLocations })

    const handleLocationChange = (location: Location, checked: boolean) => {
        setSelectedLocations({ ...selectedLocations, [location]: checked })
    }

    return (
        <>
            <LocationCheckboxes values={selectedLocations} handleChange={handleLocationChange} />
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
            </Grid>
        </>
    )
}
