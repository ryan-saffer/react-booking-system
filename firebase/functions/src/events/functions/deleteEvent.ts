import { getCalendarClient } from '../../google/CalendarClient'
import { FirestoreClient } from '../../firebase/FirestoreClient'
import { onCall } from '../../utilities'

export const deleteEvent = onCall<'deleteEvent'>(async (event) => {
    const calendarClient = await getCalendarClient()
    await calendarClient.deleteEvent(event.calendarEventId, { eventType: 'events' })
    await FirestoreClient.deleteEventBooking(event.id)
    return
})
