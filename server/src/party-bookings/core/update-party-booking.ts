import type { Booking } from 'fizz-kidz'
import { capitalise, getManager, getPartyEndDate, getStudioAddress } from 'fizz-kidz'
import { DateTime } from 'luxon'

import { DatabaseClient } from '@/firebase/DatabaseClient'
import { CalendarClient } from '@/google/CalendarClient'
import { env } from '@/init'
import { MailClient } from '@/sendgrid/MailClient'
import { logError, throwTrpcError } from '@/utilities'

export async function updatePartyBooking(input: { bookingId: string; booking: Booking }) {
    const { bookingId, booking } = input

    // serialize datetime back
    booking.dateTime = new Date(booking.dateTime)

    const existingBooking = await DatabaseClient.getPartyBooking(bookingId)
    await DatabaseClient.updatePartyBooking(bookingId, booking)

    const calendarClient = await CalendarClient.getInstance()

    if (!booking.eventId) throwTrpcError('PRECONDITION_FAILED', 'booking is missing event id', null, input)

    try {
        await calendarClient.updateEvent(
            booking.eventId,
            { eventType: 'party-bookings', type: booking.type, location: booking.location },
            {
                title: `${booking.parentFirstName} / ${booking.childName} ${booking.childAge}th ${booking.parentMobile}`,
                location: booking.type === 'mobile' ? booking.address : getStudioAddress(booking.location),
                start: booking.dateTime,
                end: getPartyEndDate(booking.dateTime, booking.partyLength),
            }
        )
    } catch (err) {
        throwTrpcError(
            'INTERNAL_SERVER_ERROR',
            `error updating calendar event for booking with id: '${bookingId}'`,
            err
        )
    }

    const isSameTime = existingBooking.dateTime.getTime() === booking.dateTime.getTime()
    const isSameLength = existingBooking.partyLength === booking.partyLength

    // if the party time has changed, send an email to the parent so its confirmed in writing
    if (!isSameTime || !isSameLength) {
        const manager = getManager(booking.location, env)
        const mailClient = await MailClient.getInstance()
        await mailClient
            .sendEmail(
                'partyTimeUpdated',
                booking.parentEmail,
                {
                    parentName: booking.parentFirstName,
                    childName: booking.childName,
                    childAge: booking.childAge,
                    startDate: DateTime.fromJSDate(booking.dateTime, { zone: 'Australia/Melbourne' }).toLocaleString(
                        DateTime.DATE_HUGE
                    ),
                    startTime: DateTime.fromJSDate(booking.dateTime, { zone: 'Australia/Melbourne' }).toLocaleString(
                        DateTime.TIME_SIMPLE
                    ),
                    endTime: DateTime.fromJSDate(getPartyEndDate(booking.dateTime, booking.partyLength), {
                        zone: 'Australia/Melbourne',
                    }).toLocaleString(DateTime.TIME_SIMPLE),
                    address: booking.type === 'mobile' ? booking.address : getStudioAddress(booking.location),
                    location: capitalise(booking.location),
                    isMobile: booking.type === 'mobile',
                    managerName: manager.name,
                },
                {
                    replyTo: manager.email,
                }
            )
            .catch((err) =>
                logError(
                    'after updating party booking, unable to send email to parent confirming new date and time',
                    err,
                    { input }
                )
            )
    }
}
