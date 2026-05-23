import { useQuery } from '@tanstack/react-query'
import { useDeferredValue } from 'react'

import { useTRPC } from '@utils/trpc'

import { useInventoryLocation } from './use-inventory-location'
import { useInventoryStore } from '../state/inventory-store'
import { ALL_CATEGORIES } from '../utils/inventory.constants'
import {
    getIsRunningLow,
    getNeedsCount,
    getStockStatusFilteredItems,
    getVisibleInventoryItems,
} from '../utils/inventory.utils'

import type { ClientInventoryStockLevel } from '../utils/inventory.types'

export function useInventoryData() {
    const trpc = useTRPC()
    const { availableLocations, canChooseLocation, location } = useInventoryLocation()
    const categoryFilter = useInventoryStore((state) => state.categoryFilter)
    const stockStatusFilter = useInventoryStore((state) => state.stockStatusFilter)
    const search = useInventoryStore((state) => state.search)
    const deferredSearch = useDeferredValue(search)
    const searchQuery = deferredSearch.trim()

    const itemsQuery = useQuery(
        trpc.inventory.listItems.queryOptions({
            includeArchived: true,
            category: categoryFilter === ALL_CATEGORIES ? undefined : categoryFilter,
        })
    )
    const stockQuery = useQuery(trpc.inventory.listStock.queryOptions({ location }))

    const stockByItemId = new Map<string, ClientInventoryStockLevel>(
        (stockQuery.data ?? []).map((stock) => [stock.itemId, stock])
    )
    const inventoryItems = (itemsQuery.data ?? []).sort((a, b) => a.name.localeCompare(b.name))
    const searchedItems = getVisibleInventoryItems(inventoryItems, searchQuery)
    const activeTrackedItems = searchedItems.filter((item) => {
        const stock = stockByItemId.get(item.id)
        return item.status === 'active' && stock?.stocked
    })
    const runningLowItemCount = activeTrackedItems.filter((item) =>
        getIsRunningLow(item, stockByItemId.get(item.id))
    ).length
    const needsCountItemCount = activeTrackedItems.filter((item) =>
        getNeedsCount(item, stockByItemId.get(item.id))
    ).length
    const notRunningLowItemCount = activeTrackedItems.filter((item) => {
        const stock = stockByItemId.get(item.id)
        return !getIsRunningLow(item, stock) && !getNeedsCount(item, stock)
    }).length
    const items = getStockStatusFilteredItems(searchedItems, stockByItemId, stockStatusFilter)

    return {
        activeTrackedCount: activeTrackedItems.length,
        availableLocations,
        canChooseLocation,
        hiddenItems: items.filter((item) => item.status === 'archived' || !stockByItemId.get(item.id)?.stocked),
        isLoading: itemsQuery.isPending || stockQuery.isPending,
        itemCount: itemsQuery.data?.length ?? 0,
        location,
        needsCountItemCount,
        notRunningLowItemCount,
        runningLowItemCount,
        shownItemCount: items.length,
        stockByItemId,
        trackedItems: items.filter((item) => item.status === 'active' && stockByItemId.get(item.id)?.stocked),
        trackedStockCount: (stockQuery.data ?? []).filter((stock) => stock.stocked).length,
    }
}
