import { ReactNode, useEffect, useState } from 'react'
import { LocationFilter, FilterContext } from './location-filter.context'

export function FilterContextProvider({ children }: { children: ReactNode }) {
    const [selectedLocation, setSelectedLocation] = useState<LocationFilter>('all')
    const filterByLocation = (location: LocationFilter) => {
        setSelectedLocation(location)
        window.localStorage.setItem('selectedLocation', location)
    }

    useEffect(() => {
        const initialLocation = window.localStorage.getItem('selectedLocation')!
        if (initialLocation) {
            setSelectedLocation(initialLocation as LocationFilter)
        }
    }, [])

    return (
        <FilterContext.Provider
            value={{
                selectedLocation,
                filterByLocation,
            }}
        >
            {children}
        </FilterContext.Provider>
    )
}
