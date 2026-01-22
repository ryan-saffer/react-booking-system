import { useContext } from 'react'

import { DateNavigationContext } from './date-navigation.context'

export function useDateNavigation() {
    const date = useContext(DateNavigationContext)
    if (date) return date
    throw new Error('`useDateNavigation()` must be used within a `<DateNavigation />`')
}
