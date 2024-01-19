import { createContext } from 'react'
import { Location } from 'fizz-kidz'

export type LocationFilter = Location | 'all'

export const FilterContext = createContext<{
    selectedLocation: LocationFilter
    filterByLocation: (location: LocationFilter) => void
} | null>(null)
