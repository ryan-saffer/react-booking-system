import { getCalendarClient } from '../../google/CalendarClient'
import { FirestoreClient } from '../../firebase/FirestoreClient'
import { logError, onCall, throwError } from '../../utilities'

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
        logError(`error updating event with id ${event.id}`, err)
        throwError('internal', `error updating event with id ${event.id}`, err)
    }
})
