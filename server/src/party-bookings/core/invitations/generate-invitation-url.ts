import { ObjectKeys, getApplicationDomain, getPartyEndDate } from 'fizz-kidz'
import { DateTime } from 'luxon'

import { DatabaseClient } from '@/firebase/DatabaseClient'
import { env } from '@/init'

/**
 * Generates a URL for a parent to create their invitation.
 *
 * Included in their booking confirmation email, and can be generated at any time in the portal.
 */
export async function generateInvitationUrl(bookingId: string) {
    const booking = await DatabaseClient.getPartyBooking(bookingId)

    const end = getPartyEndDate(booking.dateTime, booking.partyLength)
    const startTime = `${DateTime.fromJSDate(booking.dateTime, {
        zone: 'Australia/Melbourne',
    }).toFormat('h:mm a')} - ${DateTime.fromJSDate(end, {
        zone: 'Australia/Melbourne',
    }).toFormat('h:mm a')}`

    const params = {
        bookingId,
        childName: booking.childName,
        childAge: booking.childAge,
        date: booking.dateTime.toISOString(),
        time: startTime,
        $type: booking.type,
        studio: booking.location,
        address: booking.address,
        parentName: booking.parentFirstName,
        parentMobile: booking.parentMobile,
        rsvpDate: DateTime.fromJSDate(booking.dateTime, { zone: 'Australia/Melbourne' }).minus({ days: 14 }).toISO(),
    }

    let url = `${getApplicationDomain(env, process.env.FUNCTIONS_EMULATOR === 'true')}/invitation/v2?`

    ObjectKeys(params).forEach((param) => (url += `${param}=${encodeURIComponent(params[param])}&`))

    return url
}
