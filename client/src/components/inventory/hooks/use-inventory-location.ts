import { useOrg } from '@components/Session/use-org'

import { useInventoryStore } from '../state/inventory-store'
import { getAvailableInventoryLocations } from '../utils'

export function useInventoryLocation() {
    const { currentOrg } = useOrg()
    const selectedLocation = useInventoryStore((state) => state.selectedLocation)
    const canChooseLocation = currentOrg === 'master'
    const availableLocations = getAvailableInventoryLocations(currentOrg)
    const location =
        canChooseLocation && selectedLocation && availableLocations.includes(selectedLocation)
            ? selectedLocation
            : availableLocations[0]

    return { availableLocations, canChooseLocation, location }
}
