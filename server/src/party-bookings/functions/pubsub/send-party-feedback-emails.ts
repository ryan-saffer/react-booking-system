import { logger } from 'firebase-functions/v2'
import { onSchedule } from 'firebase-functions/v2/scheduler'
import { Booking, getReviewUrl } from 'fizz-kidz'
import { DateTime } from 'luxon'

import { FirestoreRefs } from '../../../firebase/FirestoreRefs'
import { MailClient } from '../../../sendgrid/MailClient'
import { logError, midnight } from '../../../utilities'

export const sendFeedbackEmails = onSchedule(
    {
        timeZone: 'Australia/Melbourne',
        schedule: '30 8 * * *', // daily at 8:30am
    },
    async () => {
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
        return
    }
)
