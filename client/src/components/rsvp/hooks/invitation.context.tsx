import type { InvitationsV2 } from 'fizz-kidz'
import { createContext } from 'react'

export const InvitationContext = createContext<InvitationsV2.Invitation | null>(null)
