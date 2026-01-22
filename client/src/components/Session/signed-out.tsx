import { useAuth } from '@components/Hooks/context/useAuth'

import type { ReactNode } from 'react'


export function SignedOut({ children }: { children: ReactNode }) {
    const user = useAuth()

    return user ? null : children
}
