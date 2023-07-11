import * as admin from 'firebase-admin'
import { getCalendarClient } from '../../calendar/CalendarClient'
import { onCall } from '../../utilities'
import {
    FirestoreBooking,
    Locations,
    capitalise,
    getApplictionDomain,
    getLocationAddress,
    getManager,
    getPartyCreationCount,
    getPartyEndDate,
    getNumberOfKidsAllowed,
    getPictureOfStudioUrl,
} from 'fizz-kidz'
import { FirestoreClient } from '../../firebase/FirestoreClient'
import { env } from '../../init'
import { getMailClient } from '../../sendgrid/MailClient'
import { DateTime } from 'luxon'

export const createPartyBooking = onCall<'createPartyBooking'>(async (input) => {
    const booking = {
        ...input,
        dateTime: admin.firestore.Timestamp.fromDate(new Date(input.dateTime)),
    } satisfies FirestoreBooking

    const bookingId = await FirestoreClient.createPartyBooking(booking)

    const end = getPartyEndDate(booking.dateTime.toDate(), booking.partyLength)

    const calendarClient = getCalendarClient()
    const eventId = await calendarClient.createEvent(
        {
            eventType: 'party-bookings',
            location: booking.location,
        },
        {
            title: `${booking.parentFirstName} / ${booking.childName} ${booking.childAge}th ${booking.parentMobile}`,
            start: booking.dateTime.toDate(),
            end,
            location: booking.location === Locations.MOBILE ? booking.address : getLocationAddress(booking.location),
            description: `${getApplictionDomain(env)}/bookings?id=${bookingId}`,
        }
    )

    await FirestoreClient.updatePartyBooking(bookingId, { eventId: eventId! })

    const manager = getManager(booking.location)

    if (booking.sendConfirmationEmail) {
        const mailClient = getMailClient()
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
                endTime: DateTime.fromJSDate(end, { zone: 'Australia/Melbourne' }).toLocaleString(DateTime.TIME_SIMPLE),
                address: booking.location === Locations.MOBILE ? booking.address : getLocationAddress(booking.location),
                location: capitalise(booking.location),
                isMobile: booking.location === Locations.MOBILE,
                creationCount: getPartyCreationCount(booking.location, booking.partyLength),
                managerName: manager.name,
                managerEmail: manager.email,
                managerMobile: manager.mobile,
                numberOfKidsAllowed: getNumberOfKidsAllowed(booking.location),
                studioPhotoUrl: getPictureOfStudioUrl(booking.location),
            },
            { replyTo: manager.email }
        )
    }
    return
})
