import { https } from 'firebase-functions/v1'
import { calendarClient } from '../../calendar/CalendarClient'
import { FirestoreClient } from '../../firebase/FirestoreClient'
import { onCall } from '../../utilities'

export const bookEvent = onCall<'bookEvent'>(async (booking) => {
    const { slots, ...rest } = booking

    // parse date strings back to date objects
    slots.forEach((slot) => {
        slot.startTime = new Date(slot.startTime)
        slot.endTime = new Date(slot.endTime)
    })

    try {
        // create events in firestore
        const eventIds = await Promise.all(
            slots.map((slot) =>
                FirestoreClient.createEventBooking({
                    ...rest,
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                })
            )
        )

        // create events in calendar
        const calendarEventIds = await Promise.all(
            slots.map((slot) =>
                calendarClient.createEvent('events', {
                    title: booking.organisation,
                    location: booking.location,
                    start: slot.startTime,
                    end: slot.endTime,
                    description: booking.notes,
                })
            )
        )

        // update calendar ids back into firestore
        await Promise.all(
            eventIds.map((eventId, idx) => {
                const calendarEventId = calendarEventIds[idx]
                if (!calendarEventId) {
                    throw new https.HttpsError('internal', `error creating calendar event for event with id ${eventId}`)
                }
                return FirestoreClient.updateEventBooking(eventId, { calendarEventId })
            })
        )
        return
    } catch (err) {
        throw new https.HttpsError('internal', 'error creating event booking', err)
    }
})
