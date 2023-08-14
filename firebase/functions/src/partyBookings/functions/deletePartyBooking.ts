import { getCalendarClient } from '../../google/CalendarClient'
import { FirestoreClient } from '../../firebase/FirestoreClient'
import { logError, onCall, throwError } from '../../utilities'

export const deletePartyBooking = onCall<'deletePartyBooking'>(async ({ bookingId, eventId, location }) => {
    const calendarClient = await getCalendarClient()
    try {
        await calendarClient.deleteEvent(eventId, { eventType: 'party-bookings', location })
    } catch (err) {
        logError(`error deleting party booking with id: '${bookingId}'`, err)
        throwError('internal', `error deleting party booking with id: '${bookingId}'`, err)
    }
    await FirestoreClient.deletePartyBooking(bookingId)
    return
})
