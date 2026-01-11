import express from 'express'
import { getApplicationDomain } from 'fizz-kidz'

import { DatabaseClient } from '@/firebase/DatabaseClient'
import { env } from '@/init'
import { generateInvitationUrl } from '@/party-bookings/core/rsvp/generate-invitation-url'

export const invitationRedirect = express.Router()

/**
 * This is the url given for all invitations. The id is the booking id.
 *
 * If the booking has an invitation, it will redirect to it. This page internally decides whether to show 'manage rsvps' or 'view invitation' based on auth.
 * Otherwise, it will redirect to the page to create an invitation.
 *
 * This approach allows for a single shareable url for everyone.
 */
invitationRedirect.get('/invitation/:id', async (req, res) => {
    const bookingId = req.params.id

    const booking = await DatabaseClient.getPartyBooking(bookingId)

    if (booking.invitationId) {
        res.redirect(
            303,
            `${getApplicationDomain(env, process.env.FUNCTIONS_EMULATOR === 'true')}/invitation/v2/${
                booking.invitationId
            }`
        )
        return
    }

    const url = await generateInvitationUrl(bookingId)
    res.redirect(303, url)
})
