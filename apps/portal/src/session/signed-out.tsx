import { useAuth } from '@session/use-auth'

import type { ReactNode } from 'react'

export function SignedOut({ children }: { children: ReactNode }) {
    const user = useAuth()

    return user?.uid ? null : children
}
