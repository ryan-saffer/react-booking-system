import type { Location } from 'fizz-kidz'
import { createContext } from 'react'

export type LocationFilter = Location | 'all'

export const FilterContext = createContext<{
    selectedLocation: LocationFilter
    filterByLocation: (location: LocationFilter) => void
} | null>(null)
