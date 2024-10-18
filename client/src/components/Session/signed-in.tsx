import type { ReactNode } from 'react'

import { useAuth } from '@components/Hooks/context/useAuth'

export function SignedIn({ children }: { children: ReactNode }) {
    const user = useAuth()

    return user ? children : null
}
