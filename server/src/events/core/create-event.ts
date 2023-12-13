import { DistributiveOmit, Event, ModuleIncursionMap, ModuleNameMap, WithoutId } from 'fizz-kidz'
import { DateTime } from 'luxon'

import { DatabaseClient } from '../../firebase/DatabaseClient'
import { CalendarClient } from '../../google/CalendarClient'
import { MailClient } from '../../sendgrid/MailClient'
import { throwTrpcError } from '../../utilities'

export type CreateEvent = {
    event: WithoutId<DistributiveOmit<Event, 'eventId' | 'startTime' | 'endTime' | 'calendarEventId'>>
    slots: {
        startTime: Date
        endTime: Date
    }[]
    sendConfirmationEmail: boolean
    emailMessage: string
}

export async function createEvent({ event, slots, sendConfirmationEmail, emailMessage }: CreateEvent) {
    if (event.$type === 'incursion') {
        console.log(event)
    }

    const calendarClient = await CalendarClient.getInstance()

    // parse date strings back to date objects
    slots.forEach((slot) => {
        slot.startTime = new Date(slot.startTime)
        slot.endTime = new Date(slot.endTime)
    })

    try {
        // create events in firestore
        const { eventId, slotIds } = await DatabaseClient.createEventBooking(event, slots)

        console.log('eventId:', eventId)
        console.log('slotIds:', slotIds)

        // create events in calendar
        const calendarEventIds = await Promise.all(
            slots.map((slot) =>
                calendarClient.createEvent(
                    { eventType: 'events' },
                    {
                        title: event.eventName,
                        location: event.address,
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
            slotIds.map((slotId, idx) => {
                const calendarEventId = calendarEventIds[idx]
                if (!calendarEventId) {
                    throwTrpcError('INTERNAL_SERVER_ERROR', `error creating calendar event for event with id ${slotId}`)
                }
                return DatabaseClient.updateEventBooking(eventId, slotId, { calendarEventId })
            })
        )
    } catch (err) {
        throwTrpcError('INTERNAL_SERVER_ERROR', 'error creating event booking', err)
    }

    // send confirmation email
    if (sendConfirmationEmail) {
        try {
            const mailClient = await MailClient.getInstance()

            const { $type: type } = event

            switch (type) {
                case 'standard': {
                    await mailClient.sendEmail('standardEventBookingConfirmation', event.contactEmail, {
                        contactName: event.contactName,
                        address: event.address,
                        emailMessage: emailMessage,
                        price: event.price,
                        slots: slots.map((slot) => ({
                            startTime: formatDate(slot.startTime),
                            endTime: formatTime(slot.endTime),
                        })),
                    })
                    break
                }
                case 'incursion': {
                    await mailClient.sendEmail('incursionBookingConfirmation', event.contactEmail, {
                        contactName: event.contactName,
                        organisation: event.organisation,
                        address: event.address,
                        slots: slots.map((slot) => ({
                            startTime: formatDate(slot.startTime),
                            endTime: formatTime(slot.endTime),
                        })),
                        emailMessage: emailMessage,
                        incursion: ModuleIncursionMap[event.module],
                        module: ModuleNameMap[event.module],
                        price: event.price,
                    })
                    break
                }
                default: {
                    const exhaustiveCheck: never = type
                    throw new Error(`Unhandled event type: '${exhaustiveCheck}'`)
                }
            }
        } catch (err) {
            throwTrpcError(
                'INTERNAL_SERVER_ERROR',
                'Event booked successfully, but an error occurred sending the confirmation email',
                err,
                { event }
            )
        }
    }
}

const formatDate = (date: Date) =>
    DateTime.fromJSDate(date, {
        zone: 'Australia/Melbourne',
    }).toLocaleString({
        weekday: 'short',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    })

const formatTime = (date: Date) =>
    DateTime.fromJSDate(date, {
        zone: 'Australia/Melbourne',
    }).toLocaleString({
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    })
