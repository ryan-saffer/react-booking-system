import { DatabaseClient } from '../../firebase/DatabaseClient'
import { CalendarClient } from '../../google/CalendarClient'
import { DeleteEvent } from './events-router'

export async function deleteEvent(event: DeleteEvent) {
    const calendarClient = await CalendarClient.getInstance()
    await calendarClient.deleteEvent(event.calendarEventId, { eventType: 'events' })
    await DatabaseClient.deleteEventBooking(event.id)
}
