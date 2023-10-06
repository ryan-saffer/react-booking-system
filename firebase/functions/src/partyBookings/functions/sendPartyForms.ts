import { onSchedule } from 'firebase-functions/v2/scheduler'
import { Booking, Locations, capitalise, getLocationAddress, getManager, getPartyEndDate } from 'fizz-kidz'
import { DateTime } from 'luxon'
import { FirestoreRefs } from '../../firebase/FirestoreRefs'
import { getMailClient } from '../../sendgrid/MailClient'
import { logError } from '../../utilities'

export const sendPartyForms = onSchedule(
    {
        timeZone: 'Australia/Melbourne',
        schedule: '30 8 * * 4',
    },
    async () => {
        const startDate = DateTime.fromObject(
            { hour: 0, minute: 0, second: 0 },
            { zone: 'Australia/Melbourne' }
        ).toJSDate()
        startDate.setDate(startDate.getDate() + ((1 + 7 - startDate.getDay()) % 7)) // will always get upcoming Tuesday
        const endDate = new Date(startDate)
        endDate.setDate(startDate.getDate() + 7)

        console.log('Start date:')
        console.log(startDate)
        console.log('End date:')
        console.log(endDate)

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
        return
    }
)

async function sendForm(bookingId: string, booking: Booking) {
    const mailClient = await getMailClient()

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
            address: booking.location === Locations.MOBILE ? booking.address : getLocationAddress(booking.location),
            location: capitalise(booking.location),
            prefilledFormUrl,
            managerName: manager.name,
            isMobile: booking.location === Locations.MOBILE,
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

function getPrefilledFormUrl(bookingId: string, booking: Booking) {
    let url = `https://fizzkidz.paperform.co/?location=${booking.location}&id=${bookingId}`
    const encodedParams: { [key: string]: string } = {
        parent_first_name: encodeURIComponent(booking.parentFirstName),
        parent_last_name: encodeURIComponent(booking.parentLastName),
        child_name: encodeURIComponent(booking.childName),
        child_age: encodeURIComponent(booking.childAge),
    }

    Object.keys(encodedParams).forEach((key) => (url += `&${key}=${encodedParams[key]}`))

    return url
}
