import type { InvitationsV2 } from 'fizz-kidz'

import { InvitationContext } from './invitation.context'

import type { ReactNode } from 'react'

export function InvitationProvider({
    invitation,
    children,
}: {
    invitation: InvitationsV2.Invitation
    children: ReactNode
}) {
    return <InvitationContext.Provider value={invitation}>{children}</InvitationContext.Provider>
}
