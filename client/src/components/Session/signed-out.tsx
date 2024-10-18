import { ReactNode } from 'react'

import { useAuth } from '@components/Hooks/context/useAuth'

export function SignedOut({ children }: { children: ReactNode }) {
    const user = useAuth()

    return user ? null : children
}
