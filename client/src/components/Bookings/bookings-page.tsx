import { useState } from 'react'

import BookingTabs from './booking-tabs'
import { DateNavigation } from './date-navigation/date-navigation'
import NewBookingDialog from './new-booking-dialog'

export const BookingsPage = () => {
    const [openNewBooking, setOpenNewBooking] = useState(false)
    return (
        <>
            <DateNavigation
                label="Bookings"
                showButton
                buttonLabel="New Booking"
                onButtonPressed={() => setOpenNewBooking(true)}
            >
                <BookingTabs />
                <NewBookingDialog open={openNewBooking} onBookingCreated={() => setOpenNewBooking(false)} />
            </DateNavigation>
        </>
    )
}
