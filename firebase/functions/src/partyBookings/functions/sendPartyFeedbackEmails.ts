import * as functions from 'firebase-functions'
import { DateTime } from 'luxon'
import { getMailClient } from '../../sendgrid/MailClient'
import { FirestoreRefs } from '../../firebase/FirestoreRefs'
import { Booking, getReviewUrl } from 'fizz-kidz'

export const sendFeedbackEmails = functions
    .region('australia-southeast1')
    .pubsub.schedule('30 8 * * *')
    .timeZone('Australia/Melbourne')
    .onRun(async () => {
        const startDate = DateTime.fromObject(
            { hour: 0, minute: 0, second: 0 },
            { zone: 'Australia/Melbourne' }
        ).toJSDate()
        startDate.setDate(startDate.getDate() - 1) // yesterday
        const endDate = DateTime.fromObject(
            { hour: 0, minute: 0, second: 0 },
            { zone: 'Australia/Melbourne' }
        ).toJSDate() // today

        console.log('Start date:')
        console.log(startDate)
        console.log('End date:')
        console.log(endDate)

        const querySnap = await FirestoreRefs.partyBookings()
            .where('dateTime', '>', startDate)
            .where('dateTime', '<', endDate)
            .get()

        const mailClient = getMailClient()

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
                functions.logger.error(`error sending feedback email for booking with id: '${querySnap.docs[idx].id}'`)
            }
        })
        return
    })
