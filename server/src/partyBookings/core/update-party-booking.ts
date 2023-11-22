import { DatabaseClient } from '../../firebase/DatabaseClient'
import { CalendarClient } from '../../google/CalendarClient'
import { logError, throwError } from '../../utilities'
import { Booking, getLocationAddress, getPartyEndDate } from 'fizz-kidz'

export async function updatePartyBooking(input: { bookingId: string; booking: Booking }) {
    const { bookingId, booking } = input

    // serialize datetime back
    booking.dateTime = new Date(booking.dateTime)

    await DatabaseClient.updatePartyBooking(bookingId, booking)

    const calendarClient = await CalendarClient.getInstance()

    if (!booking.eventId) throwError('aborted', 'booking is missing event id', null, input)

    try {
        await calendarClient.updateEvent(
            booking.eventId,
            { eventType: 'party-bookings', type: booking.type, location: booking.location },
            {
                title: `${booking.parentFirstName} / ${booking.childName} ${booking.childAge}th ${booking.parentMobile}`,
                location: booking.type === 'mobile' ? booking.address : getLocationAddress(booking.location),
                start: booking.dateTime,
                end: getPartyEndDate(booking.dateTime, booking.partyLength),
            }
        )
    } catch (err) {
        logError(`error updating calendar event for booking with id: '${bookingId}'`, err)
        throwError('internal', 'error creating calendar event', err)
    }
}
