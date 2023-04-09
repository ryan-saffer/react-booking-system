import { calendarClient } from '../../calendar/CalendarClient'
import { FirestoreClient } from '../../firebase/FirestoreClient'
import { onCall } from '../../utilities'

export const updateEvent = onCall<'updateEvent'>(async (event) => {
    // parse strings back into date
    event.startTime = new Date(event.startTime)
    event.endTime = new Date(event.endTime)
    await calendarClient.updateEvent(event.calendarEventId, 'events', {
        title: event.organisation,
        location: event.location,
        start: event.startTime,
        end: event.endTime,
        description: event.notes,
    })

    await FirestoreClient.updateEventBooking(event.id, event)
    return
})
