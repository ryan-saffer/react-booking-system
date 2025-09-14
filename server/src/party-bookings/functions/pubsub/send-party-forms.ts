import { logger } from 'firebase-functions/v2'
import type { Booking } from 'fizz-kidz'
import { capitalise, getLocationAddress, getManager, getPartyEndDate } from 'fizz-kidz'
import { DateTime } from 'luxon'

import { FirestoreRefs } from '../../../firebase/FirestoreRefs'
import { MailClient } from '../../../sendgrid/MailClient'
import { logError } from '../../../utilities'
import { getPrefilledFormUrl, getUpcoming } from '../../core/utils.party'

export async function sendPartyForms() {
    // since this runs on a Tuesday, it will get Tuesday in one week from today.
    const startDate = getUpcoming('Tuesday')
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 7)

    logger.log({ startDate })
    logger.log({ endDate })

    const bookingsRef = await FirestoreRefs.partyBookings()
    const querySnapshot = await bookingsRef.where('dateTime', '>', startDate).where('dateTime', '<', endDate).get()

    const result = await Promise.allSettled(
        querySnapshot.docs.map((documentSnapshot) => {
            const bookingId = documentSnapshot.id
            const firestoreBooking = documentSnapshot.data()
            const booking = {
                ...firestoreBooking,
                dateTime: firestoreBooking.dateTime.toDate(),
            } satisfies Booking

            return sendForm(bookingId, booking)
        })
    )

    result.map((it, idx) => {
        if (it.status === 'rejected') {
            logError(`error sending party form for booking with id: '${querySnapshot.docs[idx].id}'`)
        }
    })
}

async function sendForm(bookingId: string, booking: Booking) {
    const mailClient = await MailClient.getInstance()

    const prefilledFormUrl = getPrefilledFormUrl(bookingId, booking)
    const manager = getManager(booking.location)

    return mailClient.sendEmail(
        'partyForm',
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
            address: booking.type === 'mobile' ? booking.address : getLocationAddress(booking.location),
            location: capitalise(booking.location),
            prefilledFormUrl,
            managerName: manager.name,
            isMobile: booking.type === 'mobile',
        },
        {
            from: {
                name: 'Fizz Kidz',
                email: manager.email,
            },
            subject: `${booking.childName}'s party is coming up!`,
            replyTo: manager.email,
        }
    )
}
