import { DatabaseClient } from '../../firebase/DatabaseClient'
import { CalendarClient } from '../../google/CalendarClient'
import { onCall } from '../../utilities'

export const deleteEvent = onCall<'deleteEvent'>(async (event) => {
    const calendarClient = await CalendarClient.getInstance()
    await calendarClient.deleteEvent(event.calendarEventId, { eventType: 'events' })
    await DatabaseClient.deleteEventBooking(event.id)
    return
})
