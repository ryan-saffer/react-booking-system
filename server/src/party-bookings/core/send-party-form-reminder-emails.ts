import { logger } from 'firebase-functions/v2'

import type { Booking } from 'fizz-kidz'
import { getPartyCustomerContactInfo, getStudioContactEmail } from 'fizz-kidz'

import { FirestoreRefs } from '@/firebase/FirestoreRefs'
import { MailClient } from '@/sendgrid/MailClient'
import { logError } from '@/utilities'

import { getPartyFormUrl, getUpcoming } from './utils.party'

export async function sendPartyFormReminderEmails() {
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

async function sendFormReminder(bookingId: string, booking: Booking) {
    const mailClient = await MailClient.getInstance()

    const prefilledFormUrl = getPartyFormUrl(bookingId)
    const customerContact = getPartyCustomerContactInfo(booking.location)
    const studioContactEmail = getStudioContactEmail(booking.location)

    return mailClient.sendEmail(
        'partyFormReminder',
        booking.parentEmail,
        {
            parentName: booking.parentFirstName,
            childName: booking.childName,
            contactPhone: customerContact.phoneDisplay,
            contactSignoff: customerContact.contactSignoff,
            contactName: customerContact.contactName || '',
            prefilledFormUrl,
        },
        {
            replyTo: studioContactEmail,
        }
    )
}
