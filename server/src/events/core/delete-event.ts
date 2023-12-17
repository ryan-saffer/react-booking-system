import { CalendarClient } from '../../google/CalendarClient'
import { DatabaseClient } from '../../firebase/DatabaseClient'
import { Event } from 'fizz-kidz'
import { throwTrpcError } from '../../utilities'

export async function deleteEvent(event: Event) {
    try {
        const calendarClient = await CalendarClient.getInstance()
        await calendarClient.deleteEvent(event.calendarEventId, { eventType: 'events' })
        await DatabaseClient.deleteEventBooking(event.eventId, event.id)
    } catch (err) {
        throwTrpcError('INTERNAL_SERVER_ERROR', 'There was an error deleting the event', err)
    }
}
