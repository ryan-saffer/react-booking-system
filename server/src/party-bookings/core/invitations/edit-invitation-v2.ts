import type { InvitationsV2 } from 'fizz-kidz'

import { generateInvitationV2 } from './generate-invitation-v2'
import { linkInvitation } from './link-invitation-v2'

export async function editInvitation(invitation: InvitationsV2.Invitation) {
    const { invitationId } = await generateInvitationV2(invitation)
    await linkInvitation({ ...invitation, id: invitationId })
}
