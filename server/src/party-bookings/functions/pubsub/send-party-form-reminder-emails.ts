import { logger } from 'firebase-functions/v2'
import { onSchedule } from 'firebase-functions/v2/scheduler'
import { Booking, getManager } from 'fizz-kidz'

import { FirestoreRefs } from '../../../firebase/FirestoreRefs'
import { MailClient } from '../../../sendgrid/MailClient'
import { logError } from '../../../utilities'
import { getPrefilledFormUrl, getUpcoming } from '../../core/utils.party'

export const sentPartyFormReminder = onSchedule(
    {
        timeZone: 'Australia/Melbourne',
        schedule: '30 8 * * 1', // 8:30am every Monday
    },
    async () => {
        // since this runs on a Monday, it will get tomorrow
        const startDate = getUpcoming('Tuesday')
        const endDate = new Date(startDate)
        endDate.setDate(startDate.getDate() + 7)

        logger.log({ startDate })
        logger.log({ endDate })

        const bookingsRef = await FirestoreRefs.partyBookings()
        const querySnapshot = await bookingsRef.where('dateTime', '>', startDate).where('dateTime', '<', endDate).get()

        const result = await Promise.allSettled(
            querySnapshot.docs.map((snap) => {
                const bookingId = snap.id
                const firestoreBooking = snap.data()
                const booking = {
                    ...firestoreBooking,
                    dateTime: firestoreBooking.dateTime.toDate(),
                } satisfies Booking

                if (!firestoreBooking.partyFormFilledIn) {
                    return sendFormReminder(bookingId, booking)
                } else {
                    return Promise.resolve()
                }
            })
        )

        result.map((it, idx) => {
            if (it.status === 'rejected') {
                logError(`error sending party form reminder for booking with id: '${querySnapshot.docs[idx]}'`)
            }
        })
    }
)

async function sendFormReminder(bookingId: string, booking: Booking) {
    const mailClient = await MailClient.getInstance()

    const prefilledFormUrl = getPrefilledFormUrl(bookingId, booking)
    const manager = getManager(booking.location)

    return mailClient.sendEmail('partyFormReminder', booking.parentEmail, {
        parentName: booking.parentFirstName,
        childName: booking.childName,
        managerName: manager.name,
        managerMobile: manager.mobile,
        prefilledFormUrl,
    })
}
