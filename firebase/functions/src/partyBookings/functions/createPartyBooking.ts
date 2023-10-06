import { Timestamp } from 'firebase-admin/firestore'
import { getCalendarClient } from '../../google/CalendarClient'
import { logError, onCall, throwError } from '../../utilities'
import {
    FirestoreBooking,
    Locations,
    capitalise,
    getApplicationDomain,
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
import { getHubspotClient } from '../../hubspot/HubspotClient'

export const createPartyBooking = onCall<'createPartyBooking'>(async (input) => {
    const booking = {
        ...input,
        dateTime: Timestamp.fromDate(new Date(input.dateTime)),
    } satisfies FirestoreBooking

    const bookingId = await FirestoreClient.createPartyBooking(booking)

    const end = getPartyEndDate(booking.dateTime.toDate(), booking.partyLength)

    const calendarClient = await getCalendarClient()
    let eventId: string
    try {
        eventId = await calendarClient.createEvent(
            {
                eventType: 'party-bookings',
                location: booking.location,
            },
            {
                title: `${booking.parentFirstName} / ${booking.childName} ${booking.childAge}th ${booking.parentMobile}`,
                start: booking.dateTime.toDate(),
                end,
                location:
                    booking.location === Locations.MOBILE ? booking.address : getLocationAddress(booking.location),
                description: `${getApplicationDomain(env)}/bookings?id=${bookingId}`,
            }
        )
    } catch (err) {
        logError(`unable to create event for party booking with id: '${bookingId}'`, err)
        await FirestoreClient.deletePartyBooking(bookingId)
        throwError('internal', 'unable to create calendar event', { details: err })
    }

    await FirestoreClient.updatePartyBooking(bookingId, { eventId: eventId })

    const hubspotClient = await getHubspotClient()
    try {
        await hubspotClient.addBirthdayPartyContact({
            firstName: booking.parentFirstName,
            lastName: booking.parentLastName,
            email: booking.parentEmail,
            mobile: booking.parentMobile,
            childName: booking.childName,
            childAge: booking.childAge,
            service: booking.location === Locations.MOBILE ? 'mobile' : 'in-store',
            partyDate: booking.dateTime.toDate(),
            location: booking.location,
        })
    } catch (err) {
        logError(`error adding contact to hubspot: '${booking.parentEmail}'`, err)
    }

    const manager = getManager(booking.location)

    if (booking.sendConfirmationEmail) {
        const mailClient = await getMailClient()
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
                    address:
                        booking.location === Locations.MOBILE ? booking.address : getLocationAddress(booking.location),
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
        } catch (err) {
            logError(`error sending confirmation email for party booking with id: '${bookingId}'`, err)
            throwError('internal', 'party booked successfully, but unable to send confirmation email', err)
        }
    }
    return
})
