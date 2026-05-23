import { useQuery } from '@tanstack/react-query'

import { useOrg } from '@components/Session/use-org'
import { useTRPC } from '@utils/trpc'

import { useInventoryLocation } from './use-inventory-location'
import { useInventoryStore } from '../state/inventory-store'

export function useInventoryShoppingList() {
    const trpc = useTRPC()
    const { currentOrg, hasPermission } = useOrg()
    const { location } = useInventoryLocation()
    const startDate = useInventoryStore((state) => state.shoppingListStartDate)
    const endDate = useInventoryStore((state) => state.shoppingListEndDate)
    const selectedLocation = currentOrg === 'master' ? ('master' as const) : location
    const canViewShoppingList = hasPermission('inventory:shopping-list')
    const canGenerate = canViewShoppingList && Boolean(startDate && endDate && endDate >= startDate)

    const shoppingListQuery = useQuery(
        trpc.inventory.generateShoppingList.queryOptions(
            {
                location: selectedLocation,
                startDate: new Date(`${startDate}T00:00:00`),
                endDate: new Date(`${endDate}T23:59:59`),
            },
            { enabled: canGenerate }
        )
    )

    return {
        canGenerate,
        canViewShoppingList,
        endDate,
        location: selectedLocation,
        shoppingListQuery,
        startDate,
    }
}
