import { createContext } from 'react'

import type { Studio } from 'fizz-kidz'

export type LocationFilter = Studio | 'all'

export const FilterContext = createContext<{
    selectedLocation: LocationFilter
    filterByLocation: (location: LocationFilter) => void
} | null>(null)
