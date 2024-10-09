import { InvitationsV2 } from 'fizz-kidz'

import { DatabaseClient } from '../../firebase/DatabaseClient'
import { StorageClient } from '../../firebase/StorageClient'
import { projectId } from '../../init'

export async function linkInvitation(input: InvitationsV2.Invitation) {
    await DatabaseClient.createInvitationV2(input)

    const storage = await StorageClient.getInstance()
    const bucket = storage.bucket(`${projectId}.appspot.com`)

    // store invitationId against booking
    const booking = await DatabaseClient.getPartyBooking(input.bookingId)

    // if booking already has an invitation, check who the owner is
    if (booking.invitationId) {
        const existingInvitation = await DatabaseClient.getInvitationV2(booking.invitationId)

        // if this user is the owner document, delete the existing invitation and delete it from storage
        if (input.uid === existingInvitation.uid) {
            await bucket.file(`invitations-v2/${booking.invitationId}/invitation.png`).delete()
            await DatabaseClient.deleteInvitationV2(booking.invitationId)
        } else {
            throw new Error(
                'This booking already has an invitation that is owned by another user. Please log in to the owners account to edit the invitation, or contact Fizz Kidz for help.'
            )
        }
    }

    // update the booking to reference the new invitation
    await DatabaseClient.updatePartyBooking(input.bookingId, { invitationId: input.id, invitationOwnerUid: input.uid })
}
