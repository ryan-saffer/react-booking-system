import { useContext } from 'react'

import { FilterContext } from './location-filter.context'

export function useLocationFilter() {
    const filter = useContext(FilterContext)
    if (!filter) {
        throw new Error('`useFilter()` must be used within a `<FilterContextProvider />`')
    }
    return filter
}
