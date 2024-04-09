import { ReactNode } from 'react'

import { useAuth } from '@components/Hooks/context/useAuth'

import { useOrg } from './use-org'

export function SignedIn({ children }: { children: ReactNode }) {
    const user = useAuth()
    const {} = useOrg()

    return user ? children : null
}
