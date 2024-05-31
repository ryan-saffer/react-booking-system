import { onSchedule } from 'firebase-functions/v2/scheduler'
import { Booking, getManager } from 'fizz-kidz'
import { DateTime } from 'luxon'
import { FirestoreRefs } from '../../../firebase/FirestoreRefs'
import { getPrefilledFormUrl } from '../../../party-bookings/core/utils'
import { MailClient } from '../../../sendgrid/MailClient'
import { logError } from '../../../utilities'

export const sentPartyFormReminder = onSchedule(
    {
        timeZone: 'Australia/Melbourne',
        schedule: '30 8 * * 1', // 8:30am every monday
    },
    async () => {
        // since this runs every monday, just get all bookings between today and
        // one week from today.
        const startDate = DateTime.fromObject(
            {
                hour: 0,
                minute: 0,
                second: 0,
            },
            {
                zone: 'Australia/Melbourne',
            }
        )

        const endDate = startDate.plus({ days: 7 })

        const bookingsRef = await FirestoreRefs.partyBookings()
        const querySnapshot = await bookingsRef
            .where('dateTime', '>', startDate.toJSDate())
            .where('dateTime', '<', endDate.toJSDate())
            .get()

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
