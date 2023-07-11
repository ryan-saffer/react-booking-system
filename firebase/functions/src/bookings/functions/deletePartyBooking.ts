import { getCalendarClient } from '../../calendar/CalendarClient'
import { FirestoreClient } from '../../firebase/FirestoreClient'
import { onCall } from '../../utilities'
import { logger, https } from 'firebase-functions'

export const deletePartyBooking = onCall<'deletePartyBooking'>(async ({ bookingId, eventId, location }) => {
    const calendarClient = getCalendarClient()
    try {
        await calendarClient.deleteEvent(eventId, { eventType: 'party-bookings', location })
    } catch (err) {
        logger.error(`error deleting party booking with id: '${bookingId}'`)
        logger.error(err)
        throw new https.HttpsError('internal', `error deleting party booking with id: '${bookingId}'`, { details: err })
    }
    await FirestoreClient.deletePartyBooking(bookingId)
    return
})
