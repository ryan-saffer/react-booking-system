import { logger } from 'firebase-functions/v2'
import { DateTime } from 'luxon'

import type { Booking } from 'fizz-kidz'
import { getReviewUrl } from 'fizz-kidz'

import { FirestoreRefs } from '../../firebase/FirestoreRefs'
import { MailClient } from '../../sendgrid/MailClient'
import { logError, midnight } from '../../utilities'

export async function sendPartyFeedbackEmails() {
    const today = midnight(DateTime.now().setZone('Australia/Melbourne'))
    const startDate = today.minus({ days: 1 }).toJSDate() // yesterday
    const endDate = today.toJSDate() // today

    logger.log({ startDate })
    logger.log({ endDate })

    const bookingsRef = await FirestoreRefs.partyBookings()

    const querySnap = await bookingsRef.where('dateTime', '>', startDate).where('dateTime', '<', endDate).get()

    const mailClient = await MailClient.getInstance()

    const result = await Promise.allSettled(
        querySnap.docs.map((docSnap) => {
            const firestoreBooking = docSnap.data()
            const booking = {
                ...firestoreBooking,
                createdAt: firestoreBooking.createdAt.toDate(),
                dateTime: firestoreBooking.dateTime.toDate(),
            } satisfies Booking

            return mailClient.sendEmail('partyFeedback', booking.parentEmail, {
                parentName: booking.parentFirstName,
                childName: booking.childName,
                reviewUrl: getReviewUrl(booking.location),
            })
        })
    )

    result.map((it, idx) => {
        if (it.status === 'rejected') {
            logError(`error sending feedback email for booking with id: '${querySnap.docs[idx].id}'`)
        }
    })
}
