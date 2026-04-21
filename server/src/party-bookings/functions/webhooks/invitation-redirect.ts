import express from 'express'

import { getInvitationShareUrl } from 'fizz-kidz'

import { DatabaseClient } from '@/firebase/DatabaseClient'
import { env } from '@/init'
import { generateInvitationUrl } from '@/party-bookings/core/rsvp/generate-invitation-url'
import { isUsingEmulator } from '@/utilities'

export const invitationEntryRedirect = express.Router()

/**
 * Booking-based invitation entry route.
 *
 * This is the long-term host/customer entry point and resolves a bookingId to either:
 * - the canonical public invite URL when an invitation already exists, or
 * - the invitation design flow when one has not been created yet.
 */
invitationEntryRedirect.get('/invitation/:id', async (req, res) => {
    const bookingId = req.params.id

    if (!bookingId || bookingId === ':id') {
        res.redirect(303, `https://www.fizzkidz.com.au/404`)
        return
    }

    let booking
    try {
        booking = await DatabaseClient.getPartyBooking(bookingId)
    } catch {
        res.redirect(303, `https://www.fizzkidz.com.au/404`)
        return
    }

    if (booking.invitationId) {
        res.redirect(303, getInvitationShareUrl(env, isUsingEmulator(), booking.invitationId))
        return
    }

    const url = await generateInvitationUrl(bookingId)
    res.redirect(303, url)
})
