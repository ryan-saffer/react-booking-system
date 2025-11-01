import type { Studio } from 'fizz-kidz'
import { createContext } from 'react'

export type LocationFilter = Studio | 'all'

export const FilterContext = createContext<{
    selectedLocation: LocationFilter
    filterByLocation: (location: LocationFilter) => void
} | null>(null)
