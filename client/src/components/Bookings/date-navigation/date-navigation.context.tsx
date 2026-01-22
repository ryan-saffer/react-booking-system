import { createContext } from 'react'

import type { DateTime } from 'luxon'

export const DateNavigationContext = createContext<{
    date: DateTime
    setDate: (date: DateTime) => void
    setLoading: (loading: boolean) => void
} | null>(null)
