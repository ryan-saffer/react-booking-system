import { https, logger } from 'firebase-functions/v1'
import { getCalendarClient } from '../../calendar/CalendarClient'
import { FirestoreClient } from '../../firebase/FirestoreClient'
import { onCall } from '../../utilities'

export const updateEvent = onCall<'updateEvent'>(async (event) => {
    // parse strings back into date
    event.startTime = new Date(event.startTime)
    event.endTime = new Date(event.endTime)

    try {
        await getCalendarClient().updateEvent(
            event.calendarEventId,
            { eventType: 'events' },
            {
                title: event.eventName,
                location: event.location,
                start: event.startTime,
                end: event.endTime,
                description: event.notes,
            }
        )

        await FirestoreClient.updateEventBooking(event.id, event)
    } catch (err) {
        logger.error(`error updating event with id ${event.id}`, err)
        throw new https.HttpsError('internal', `error updating event with id ${event.id}`, err)
    }
})
