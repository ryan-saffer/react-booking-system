import { getCalendarClient } from '../../calendar/CalendarClient'
import { FirestoreClient } from '../../firebase/FirestoreClient'
import { onCall } from '../../utilities'

export const deleteEvent = onCall<'deleteEvent'>(async (event) => {
    await getCalendarClient().deleteEvent(event.calendarEventId, 'events')
    await FirestoreClient.deleteEventBooking(event.id)
    return
})