import { DateTime } from 'luxon'

import { DatabaseClient } from '../../firebase/DatabaseClient'
import { CalendarClient } from '../../google/CalendarClient'
import { MailClient } from '../../sendgrid/MailClient'
import { throwFunctionsError, throwTrpcError } from '../../utilities'
import { CreateEvent } from './events-router'

export async function createEvent({ event, sendConfirmationEmail, emailMessage }: CreateEvent) {
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
                    throwFunctionsError('internal', `error creating calendar event for event with id ${eventId}`)
                }
                return DatabaseClient.updateEventBooking(eventId, { calendarEventId })
            })
        )
    } catch (err) {
        throwTrpcError('INTERNAL_SERVER_ERROR', 'error creating event booking', err)
    }

    // send confirmation email
    if (sendConfirmationEmail) {
        try {
            const mailClient = await MailClient.getInstance()
            await mailClient.sendEmail('eventBooking', event.contactEmail, {
                contactName: event.contactName,
                location: event.location,
                emailMessage: emailMessage,
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
            throwTrpcError(
                'INTERNAL_SERVER_ERROR',
                'Event booked successfully, but an error occurred sending the confirmation email',
                err
            )
        }
    }
}
