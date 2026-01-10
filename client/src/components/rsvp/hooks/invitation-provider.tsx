import type { InvitationsV2 } from 'fizz-kidz'
import type { ReactNode } from 'react'
import { InvitationContext } from './invitation.context'

export function InvitationProvider({
    invitation,
    children,
}: {
    invitation: InvitationsV2.Invitation
    children: ReactNode
}) {
    return <InvitationContext.Provider value={invitation}>{children}</InvitationContext.Provider>
}
