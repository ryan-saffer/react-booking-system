import { useContext } from 'react'
import { InvitationContext } from './invitation.context'

export function useInvitation() {
    const invitation = useContext(InvitationContext)
    if (invitation === null) {
        throw new Error('Only `useInvitation()` within an `<InvitationProvider />`')
    }
    return invitation
}
