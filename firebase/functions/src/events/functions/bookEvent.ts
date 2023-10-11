import { DatabaseClient } from '../../firebase/DatabaseClient'
import { logError, onCall, throwError } from '../../utilities'
import { DateTime } from 'luxon'
import { CalendarClient } from '../../google/CalendarClient'
import { MailClient } from '../../sendgrid/MailClient'

export const bookEvent = onCall<'bookEvent'>(async (input) => {
    const { event } = input
    const { slots, ...rest } = event

    const calendarClient = await CalendarClient.getInstance()

    // parse date strings back to date objects
    slots.forEach((slot) => {
        slot.startTime = new Date(slot.startTime)
        slot.endTime = new Date(slot.endTime)
    })

    try {
        // create events in firestore
        const eventIds = await Promise.all(
            slots.map((slot) =>
                DatabaseClient.createEventBooking({
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
                    { eventType: 'events' },
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
                    throwError('internal', `error creating calendar event for event with id ${eventId}`)
                }
                return DatabaseClient.updateEventBooking(eventId, { calendarEventId })
            })
        )
    } catch (err) {
        logError('error creating event booking', err, { event })
        throwError('internal', 'error creating event booking', err)
    }

    // send confirmation email
    if (input.sendConfirmationEmail) {
        try {
            const mailClient = await MailClient.getInstance()
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
            logError('event booked successfully, but an error occurred sending the confirmation email', err)
        }
    }
})
