import type { InvitationsV2 } from 'fizz-kidz'

import { DatabaseClient } from '@/firebase/DatabaseClient'
import { MixpanelClient } from '@/mixpanel/mixpanel-client'

import { deleteInvitationV2 } from './delete-invitation-v2'
import { moveInvitation } from './move-invitation-v2'

export async function linkInvitation(invitation: InvitationsV2.Invitation) {
    invitation.date = new Date(invitation.date)
    invitation.rsvpDate = new Date(invitation.rsvpDate)

    // store invitationId against booking
    const booking = await DatabaseClient.getPartyBooking(invitation.bookingId)

    // tracking
    const mixpanel = await MixpanelClient.getInstance()
    await mixpanel.track('invitation-generated-v2', {
        invitationId: invitation.id,
        partyDate: invitation.date,
        invitation: invitation.invitation,
        bookingId: invitation.bookingId,
        parentName: invitation.parentName,
        parentEmail: booking.parentEmail,
    })

    // if booking already has an invitation, check who the owner is
    if (booking.invitationId) {
        const existingInvitation = await DatabaseClient.getInvitationV2(booking.invitationId)

        // check if the user owns the existing invitation
        if (invitation.uid === existingInvitation.uid) {
            // since they own it, it is safe to link this invitation.
            // however we need to replace the existing invitation with this new invitation,
            // because the invitation may have already been shared and therefore the new invitation must have the same id as the old invitation.

            // first delete the existing invitation
            await deleteInvitationV2(booking.invitationId)

            // then move the new invitation to the old ones location
            await moveInvitation(booking.invitationId, invitation)

            return { invitationId: booking.invitationId }
        } else {
            throw new Error(
                'This booking already has an invitation that is owned by another user. Please log in to the owners account to edit the invitation, or contact Fizz Kidz for help.'
            )
        }
    } else {
        // move the file in storage from temp to its final location
        await moveInvitation(invitation.id, invitation)

        // update the booking to reference the new invitation
        await DatabaseClient.updatePartyBooking(invitation.bookingId, {
            invitationId: invitation.id,
            invitationOwnerUid: invitation.uid,
        })

        return { invitationId: invitation.id }
    }
}
