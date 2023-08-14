import { getCalendarClient } from '../../google/CalendarClient'
import { logError, onCall, throwError } from '../../utilities'
import { Locations, getLocationAddress, getPartyEndDate } from 'fizz-kidz'
import { FirestoreClient } from '../../firebase/FirestoreClient'

export const updatePartyBooking = onCall<'updatePartyBooking'>(async (input) => {
    const { bookingId, booking } = input

    // serialize datetime back
    booking.dateTime = new Date(booking.dateTime)

    await FirestoreClient.updatePartyBooking(bookingId, booking)

    const calendarClient = await getCalendarClient()

    if (!booking.eventId) throwError('aborted', 'booking is missing event id')

    try {
        await calendarClient.updateEvent(
            booking.eventId,
            { eventType: 'party-bookings', location: booking.location },
            {
                title: `${booking.parentFirstName} / ${booking.childName} ${booking.childAge}th ${booking.parentMobile}`,
                location:
                    booking.location === Locations.MOBILE ? booking.address : getLocationAddress(booking.location),
                start: booking.dateTime,
                end: getPartyEndDate(booking.dateTime, booking.partyLength),
            }
        )
    } catch (err) {
        logError(`error updating calendar event for booking with id: '${bookingId}'`, err)
        throwError('internal', 'error creating calendar event', err)
    }
    return
})
