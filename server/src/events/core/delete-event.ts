import { DatabaseClient } from '../../firebase/DatabaseClient'
import { CalendarClient } from '../../google/CalendarClient'
import { throwTrpcError } from '../../utilities'
import { DeleteEvent } from './events-router'

export async function deleteEvent(event: DeleteEvent) {
    try {
        const calendarClient = await CalendarClient.getInstance()
        await calendarClient.deleteEvent(event.calendarEventId, { eventType: 'events' })
        await DatabaseClient.deleteEventBooking(event.id)
    } catch (err) {
        throwTrpcError('INTERNAL_SERVER_ERROR', 'There was an error deleting the event', err)
    }
}
