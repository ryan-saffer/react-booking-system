import { calendarClient } from '../../calendar/CalendarClient'
import { FirestoreClient } from '../../firebase/FirestoreClient'
import { onCall } from '../../utilities'

export const deleteEvent = onCall<'deleteEvent'>(async (event) => {
    await calendarClient.deleteEvent(event.calendarEventId, 'events')
    await FirestoreClient.deleteEventBooking(event.id)
    return
})
