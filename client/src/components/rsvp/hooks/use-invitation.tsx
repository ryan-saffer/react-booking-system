import { useContext } from 'react'

import { InvitationContext } from './invitation-provider'

export function useInvitation() {
    const invitation = useContext(InvitationContext)
    if (invitation === null) {
        throw new Error('Only `useInvitation()` within an `<InvitationProvider />`')
    }
    return invitation
}
