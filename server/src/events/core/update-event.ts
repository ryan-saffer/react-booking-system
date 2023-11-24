import { CalendarClient } from '../../google/CalendarClient'
import { DatabaseClient } from '../../firebase/DatabaseClient'
import { UpdateEvent } from '../functions/trpc/trpc.events'
import { throwTrpcError } from '../../utilities'

export async function updateEvent(event: UpdateEvent) {
    // parse strings back into date
    event.startTime = new Date(event.startTime)
    event.endTime = new Date(event.endTime)

    try {
        const calendarClient = await CalendarClient.getInstance()
        await calendarClient.updateEvent(
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

        await DatabaseClient.updateEventBooking(event.id, event)
    } catch (err) {
        throwTrpcError('INTERNAL_SERVER_ERROR', `error updating event with id ${event.id}`, err)
    }
}
