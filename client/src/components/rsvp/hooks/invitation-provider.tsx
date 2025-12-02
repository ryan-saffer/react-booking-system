import type { InvitationsV2 } from 'fizz-kidz'
import type { ReactNode } from 'react'
import { createContext } from 'react'
export const InvitationContext = createContext<InvitationsV2.Invitation | null>(null)

export function InvitationProvider({
    invitation,
    children,
}: {
    invitation: InvitationsV2.Invitation
    children: ReactNode
}) {
    return <InvitationContext.Provider value={invitation}>{children}</InvitationContext.Provider>
}
