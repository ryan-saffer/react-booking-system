import { https } from 'firebase-functions/v1'
import { calendarClient } from '../../calendar/CalendarClient'
import { FirestoreClient } from '../../firebase/FirestoreClient'
import { onCall } from '../../utilities'

export const bookEvent = onCall<'bookEvent'>(async (booking) => {
    // parse date strings back to date objects
    booking.startTime = new Date(booking.startTime)
    booking.endTime = new Date(booking.endTime)

    try {
        const id = await FirestoreClient.createEventBooking(booking)

        const result = await calendarClient.createEvent(
            booking.organisation,
            booking.location,
            booking.startTime,
            booking.endTime,
            'events',
            booking.notes
        )

        if (!result) {
            throw new https.HttpsError('internal', `error creating calendar event for event booking ${id}`)
        }

        await FirestoreClient.updateEventBooking(id, { calendarEventId: result })

        return id
    } catch (err) {
        throw new https.HttpsError('internal', 'error creating event booking', err)
    }
})
