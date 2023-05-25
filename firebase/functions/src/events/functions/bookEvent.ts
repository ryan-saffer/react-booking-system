import { https, logger } from 'firebase-functions/v1'
import { calendarClient } from '../../calendar/CalendarClient'
import { FirestoreClient } from '../../firebase/FirestoreClient'
import { onCall } from '../../utilities'
import { mailClient } from '../../sendgrid/MailClient'
import { DateTime } from 'luxon'

export const bookEvent = onCall<'bookEvent'>(async (input) => {
    const { event } = input
    const { slots, ...rest } = event

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
                calendarClient.createEvent(
                    'events',
                    {
                        title: event.eventName,
                        location: event.location,
                        start: slot.startTime,
                        end: slot.endTime,
                        description: event.notes,
                    },
                    { useExponentialBackoff: true }
                )
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
    } catch (err) {
        logger.error('error creating event booking', event, err)
        throw new https.HttpsError('internal', 'error creating event booking', err)
    }

    // send confirmation email
    if (input.sendConfirmationEmail) {
        try {
            await mailClient.sendEmail('eventBooking', event.contactEmail, {
                contactName: event.contactName,
                location: event.location,
                emailMessage: input.emailMessage,
                price: event.price,
                slots: slots.map((slot) => ({
                    startTime: DateTime.fromJSDate(slot.startTime, {
                        zone: 'Australia/Melbourne',
                    }).toLocaleString({
                        weekday: 'long',
                        month: 'short',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                    }),
                    endTime: DateTime.fromJSDate(slot.endTime, {
                        zone: 'Australia/Melbourne',
                    }).toLocaleString({
                        weekday: 'long',
                        month: 'short',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                    }),
                })),
            })
        } catch (err) {
            logger.error('event booked successfully, but an error occurred sending the confirmation email', err)
        }
    }
})
