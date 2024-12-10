import { ReactNode } from 'react'

import { useAuth } from '@components/Hooks/context/useAuth'

export function SignedIn({ children }: { children: ReactNode }) {
    const user = useAuth()

    return user && !user.isAnonymous ? children : null
}
