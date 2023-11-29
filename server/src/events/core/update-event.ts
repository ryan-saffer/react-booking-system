import { CalendarClient } from '../../google/CalendarClient'
import { DatabaseClient } from '../../firebase/DatabaseClient'
import { Event } from 'fizz-kidz'
import { throwTrpcError } from '../../utilities'

export async function updateEvent(event: Event) {
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
                location: event.address,
                start: event.startTime,
                end: event.endTime,
                description: event.notes,
            }
        )

        const siblings = await DatabaseClient.updateEventBooking(event.eventId, event.id, event)

        await Promise.all(
            siblings.map((sibling) =>
                calendarClient.updateEvent(
                    sibling.calendarEventId,
                    { eventType: 'events' },
                    {
                        title: event.eventName,
                        location: event.address,
                        start: sibling.startTime,
                        end: sibling.endTime,
                        description: event.notes,
                    },
                    { useExponentialBackoff: true }
                )
            )
        )
    } catch (err) {
        console.log(err)
        throwTrpcError('INTERNAL_SERVER_ERROR', `error updating event with id ${event.id}`, err)
    }
}
