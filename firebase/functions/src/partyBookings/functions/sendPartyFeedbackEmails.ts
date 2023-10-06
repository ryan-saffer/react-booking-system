import { onSchedule } from 'firebase-functions/v2/scheduler'
import { DateTime } from 'luxon'
import { getMailClient } from '../../sendgrid/MailClient'
import { FirestoreRefs } from '../../firebase/FirestoreRefs'
import { Booking, getReviewUrl } from 'fizz-kidz'
import { logError } from '../../utilities'

export const sendFeedbackEmails = onSchedule(
    {
        timeZone: 'Australia/Melbourne',
        schedule: '30 8 * * *',
    },
    async () => {
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

        const bookingsRef = await FirestoreRefs.partyBookings()

        const querySnap = await bookingsRef.where('dateTime', '>', startDate).where('dateTime', '<', endDate).get()

        const mailClient = await getMailClient()

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
