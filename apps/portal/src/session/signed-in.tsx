import { useAuth } from '@session/use-auth'

import type { ReactNode } from 'react'

export function SignedIn({ children }: { children: ReactNode }) {
    const user = useAuth()

    return user?.uid ? children : null
}
