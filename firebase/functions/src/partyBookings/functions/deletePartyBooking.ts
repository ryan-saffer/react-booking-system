import { DatabaseClient } from '../../firebase/DatabaseClient'
import { CalendarClient } from '../../google/CalendarClient'
import { logError, onCall, throwError } from '../../utilities'

export const deletePartyBooking = onCall<'deletePartyBooking'>(async ({ bookingId, eventId, location }) => {
    const calendarClient = await CalendarClient.getInstance()
    try {
        await calendarClient.deleteEvent(eventId, { eventType: 'party-bookings', location })
    } catch (err) {
        logError(`error deleting party booking with id: '${bookingId}'`, err)
        throwError('internal', `error deleting party booking with id: '${bookingId}'`, err)
    }
    await DatabaseClient.deletePartyBooking(bookingId)
    return
})
