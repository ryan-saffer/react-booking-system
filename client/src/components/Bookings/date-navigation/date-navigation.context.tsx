import type { DateTime } from 'luxon'
import { createContext } from 'react'

export const DateNavigationContext = createContext<{
    date: DateTime
    setDate: (date: DateTime) => void
    setLoading: (loading: boolean) => void
} | null>(null)
