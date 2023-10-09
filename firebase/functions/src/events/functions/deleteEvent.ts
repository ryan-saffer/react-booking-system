import { FirestoreClient } from '../../firebase/FirestoreClient'
import { CalendarClient } from '../../google/CalendarClient'
import { onCall } from '../../utilities'

export const deleteEvent = onCall<'deleteEvent'>(async (event) => {
    const calendarClient = await CalendarClient.getInstance()
    await calendarClient.deleteEvent(event.calendarEventId, { eventType: 'events' })
    await FirestoreClient.deleteEventBooking(event.id)
    return
})
