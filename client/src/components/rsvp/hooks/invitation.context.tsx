import { createContext } from 'react'

import type { InvitationsV2 } from 'fizz-kidz'

export const InvitationContext = createContext<InvitationsV2.Invitation | null>(null)
