import { DatabaseClient } from '../../firebase/DatabaseClient'
import { CalendarClient } from '../../google/CalendarClient'
import { logError, throwError } from '../../utilities'
import { UpdateEvent } from './events-router'

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
        logError(`error updating event with id ${event.id}`, err)
        throwError('internal', `error updating event with id ${event.id}`, err)
    }
}
