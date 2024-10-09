import { useAuth } from '@components/Hooks/context/useAuth'

import type { ReactNode } from 'react'


export function SignedIn({ children }: { children: ReactNode }) {
    const user = useAuth()

    return user && !user.isAnonymous ? children : null
}
