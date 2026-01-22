import { useState } from 'react'

import { FilterContext } from './location-filter.context'

import type { LocationFilter } from './location-filter.context'
import type { ReactNode } from 'react'

export function FilterContextProvider({ children }: { children: ReactNode }) {
    const [selectedLocation, setSelectedLocation] = useState<LocationFilter>(() => {
        const initialLocation = window.localStorage.getItem('selectedLocation')
        return initialLocation ? (initialLocation as LocationFilter) : 'all'
    })
    const filterByLocation = (location: LocationFilter) => {
        setSelectedLocation(location)
        window.localStorage.setItem('selectedLocation', location)
    }

    return (
        <FilterContext
            value={{
                selectedLocation,
                filterByLocation,
            }}
        >
            {children}
        </FilterContext>
    )
}
