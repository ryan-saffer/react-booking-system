import type { InvitationsV2 } from 'fizz-kidz'

import { generateInvitationV2 } from './generate-invitation-v2'
import { linkInvitation } from './link-invitation-v2'

/**
 * Used for editing existing invitations. Generates a new one and replaces the existing one.
 */
export async function generateAndLinkInvitation(invitation: InvitationsV2.Invitation) {
    const { invitationId } = await generateInvitationV2(invitation)
    await linkInvitation({ ...invitation, id: invitationId })
}
