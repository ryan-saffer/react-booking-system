import { DateTime } from 'luxon'

import type { Booking } from 'fizz-kidz'
import {
    capitalise,
    getApplicationDomain,
    getStudioAddress,
    getManager,
    getNumberOfKidsAllowed,
    getPartyCreationCount,
    getPartyEndDate,
    getPictureOfStudioUrl,
    getRsvpUrl,
} from 'fizz-kidz'

import { DatabaseClient } from '@/firebase/DatabaseClient'
import { CalendarClient } from '@/google/CalendarClient'
import { env } from '@/init'
import { MailClient } from '@/sendgrid/MailClient'
import { isUsingEmulator, logError, throwTrpcError } from '@/utilities'
import { ZohoClient } from '@/zoho/zoho-client'

import { getCakeFormUrl } from './utils.party'

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

        const startTime = `${DateTime.fromJSDate(booking.dateTime, {
            zone: 'Australia/Melbourne',
        }).toFormat('h:mm a')} - ${DateTime.fromJSDate(getPartyEndDate(booking.dateTime, booking.partyLength), {
            zone: 'Australia/Melbourne',
        }).toFormat('h:mm a')}`

        const params = [
            `childName=${encodeURIComponent(booking.childName)}`,
            `childAge=${encodeURIComponent(booking.childAge)}`,
            `date=${encodeURIComponent(booking.dateTime.toISOString())}`,
            `time=${encodeURIComponent(startTime)}`,
            `type=${encodeURIComponent(booking.type)}`,
            `studio=${encodeURIComponent(booking.location)}`,
            `address=${encodeURIComponent(booking.address)}`,
            `rsvpName=${encodeURIComponent(booking.parentFirstName)}`,
            `rsvpDate=${encodeURIComponent(
                DateTime.fromJSDate(booking.dateTime, { zone: 'Australia/Melbourne' }).minus({ days: 14 }).toISO()
            )}`,
            `rsvpNumber=${encodeURIComponent(booking.parentMobile)}`,
        ]

        const invitationsUrl = booking.useRsvpSystem
            ? getRsvpUrl(env, isUsingEmulator(), bookingId)
            : `${getApplicationDomain(env, isUsingEmulator())}/invitations?${params.join('&')}`

        await mailClient
            .sendEmail(
                'partyBookingConfirmation',
                booking.parentEmail,
                {
                    header: `${booking.childName}'s party time has been updated`,
                    openingLine: `We've updated the time for ${booking.childName}'s ${booking.childAge}th birthday party. Here is the updated date and time:`,
                    parentName: booking.parentFirstName,
                    childName: booking.childName,
                    childAge: booking.childAge,
                    startDate: DateTime.fromJSDate(booking.dateTime, {
                        zone: 'Australia/Melbourne',
                    }).toLocaleString(DateTime.DATE_HUGE),
                    startTime: DateTime.fromJSDate(booking.dateTime, {
                        zone: 'Australia/Melbourne',
                    }).toLocaleString(DateTime.TIME_SIMPLE),
                    endTime: DateTime.fromJSDate(getPartyEndDate(booking.dateTime, booking.partyLength), {
                        zone: 'Australia/Melbourne',
                    }).toLocaleString(DateTime.TIME_SIMPLE),
                    address: booking.type === 'mobile' ? booking.address : getStudioAddress(booking.location),
                    location: capitalise(booking.location),
                    isMobile: booking.type === 'mobile',
                    creationCount: getPartyCreationCount(booking.type, booking.partyLength),
                    managerName: manager.name,
                    managerEmail: manager.email,
                    managerMobile: manager.mobile,
                    managerObjectPronoun: manager.objectPronoun,
                    managerSubjectPronoun: capitalise(manager.subjectPronoun),
                    numberOfKidsAllowed: getNumberOfKidsAllowed(booking.location),
                    studioPhotoUrl: getPictureOfStudioUrl(booking.location),
                    invitationsUrl,
                    includesFood: booking.includesFood,
                    canOrderCake: booking.type === 'studio',
                    cakeFormUrl: getCakeFormUrl(bookingId),
                    useRsvpSystem: booking.useRsvpSystem,
                },
                {
                    subject: 'Your party booking has been updated',
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

        if (booking.zohoDealId) {
            const zohoClient = new ZohoClient()
            await zohoClient
                .updatePartyDetailEventDate(booking.zohoDealId, booking.dateTime.toISOString())
                .catch((err) =>
                    logError('after updating party time, error updating event date in zoho deal', err, { booking })
                )
        }
    }
}
