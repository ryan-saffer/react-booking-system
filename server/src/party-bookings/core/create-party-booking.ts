import { Timestamp } from 'firebase-admin/firestore'
import type { Booking, FirestoreBooking } from 'fizz-kidz'
import {
    Location,
    capitalise,
    getApplicationDomain,
    getLocationAddress,
    getManager,
    getNumberOfKidsAllowed,
    getPartyCreationCount,
    getPartyEndDate,
    getPictureOfStudioUrl,
} from 'fizz-kidz'
import { DateTime } from 'luxon'
import { DatabaseClient } from '../../firebase/DatabaseClient'
import { CalendarClient } from '../../google/CalendarClient'
import { env } from '../../init'
import { MailClient } from '../../sendgrid/MailClient'
import { logError, throwTrpcError } from '../../utilities'
import { ZohoClient } from '../../zoho/zoho-client'
import { MixpanelClient } from '../../mixpanel/mixpanel-client'

export async function createPartyBooking(_booking: Booking) {
    const booking = {
        ..._booking,
        dateTime: Timestamp.fromDate(new Date(_booking.dateTime)),
    } satisfies FirestoreBooking

    const bookingId = await DatabaseClient.createPartyBooking(booking)

    const end = getPartyEndDate(booking.dateTime.toDate(), booking.partyLength)

    const calendarClient = await CalendarClient.getInstance()
    let eventId: string
    try {
        eventId = await calendarClient.createEvent(
            {
                eventType: 'party-bookings',
                type: booking.type,
                location: booking.location,
            },
            {
                title: `${booking.parentFirstName} / ${booking.childName} ${booking.childAge}th ${booking.parentMobile}`,
                start: booking.dateTime.toDate(),
                end,
                location: booking.type === 'mobile' ? booking.address : getLocationAddress(booking.location),
                description: `${getApplicationDomain(env)}/dashboard/bookings?id=${bookingId}`,
            }
        )
    } catch (err) {
        await DatabaseClient.deletePartyBooking(bookingId)
        throwTrpcError('INTERNAL_SERVER_ERROR', 'unable to create calendar event', err)
    }

    await DatabaseClient.updatePartyBooking(bookingId, { eventId })

    const zohoClient = new ZohoClient()
    try {
        await zohoClient.addBirthdayPartyContact({
            firstName: booking.parentFirstName,
            lastName: booking.parentLastName,
            email: booking.parentEmail,
            mobile: booking.parentMobile,
            partyDate: booking.dateTime.toDate(),
            studio: booking.location,
            type: booking.type,
        })
    } catch (err) {
        logError(`error adding contact to zoho: '${booking.parentEmail}'`, err)
    }

    // create the personalised invite url
    const startTime = `${DateTime.fromJSDate(booking.dateTime.toDate(), {
        zone: 'Australia/Melbourne',
    }).toFormat('h:mm a')} - ${DateTime.fromJSDate(end, {
        zone: 'Australia/Melbourne',
    }).toFormat('h:mm a')}`

    const params = [
        `childName=${encodeURIComponent(booking.childName)}`,
        `childAge=${encodeURIComponent(booking.childAge)}`,
        `date=${encodeURIComponent(booking.dateTime.toDate().toISOString())}`,
        `time=${encodeURIComponent(startTime)}`,
        `type=${encodeURIComponent(booking.type)}`,
        `studio=${encodeURIComponent(booking.location)}`,
        `address=${encodeURIComponent(booking.address)}`,
        `rsvpName=${encodeURIComponent(booking.parentFirstName)}`,
        `rsvpDate=${encodeURIComponent(
            DateTime.fromJSDate(booking.dateTime.toDate(), { zone: 'Australia/Melbourne' }).minus({ days: 14 }).toISO()
        )}`,
        `rsvpNumber=${encodeURIComponent(booking.parentMobile)}`,
    ]

    const invitationsUrl = `${getApplicationDomain(env)}/invitations?${params.join('&')}`

    const manager = getManager(booking.location)

    if (booking.sendConfirmationEmail) {
        const mailClient = await MailClient.getInstance()
        try {
            await mailClient.sendEmail(
                'partyBookingConfirmation',
                booking.parentEmail,
                {
                    parentName: booking.parentFirstName,
                    childName: booking.childName,
                    childAge: booking.childAge,
                    startDate: DateTime.fromJSDate(booking.dateTime.toDate(), {
                        zone: 'Australia/Melbourne',
                    }).toLocaleString(DateTime.DATE_HUGE),
                    startTime: DateTime.fromJSDate(booking.dateTime.toDate(), {
                        zone: 'Australia/Melbourne',
                    }).toLocaleString(DateTime.TIME_SIMPLE),
                    endTime: DateTime.fromJSDate(end, { zone: 'Australia/Melbourne' }).toLocaleString(
                        DateTime.TIME_SIMPLE
                    ),
                    address: booking.type === 'mobile' ? booking.address : getLocationAddress(booking.location),
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
                    canOrderCake: booking.type === 'studio' && booking.location === Location.MALVERN,
                },
                { replyTo: manager.email }
            )
        } catch (err) {
            throwTrpcError(
                'INTERNAL_SERVER_ERROR',
                'party booked successfully, but unable to send confirmation email',
                err
            )
        }
    }

    // analytics
    const mixpanel = await MixpanelClient.getInstance()
    await mixpanel.track('birthday-party-booking', {
        distinct_id: booking.parentEmail,
        location: booking.location,
        length: booking.partyLength,
        includesFood: booking.includesFood,
        type: booking.type,
        childAge: booking.childAge,
        date: booking.dateTime.toDate().toISOString(),
    })
}
