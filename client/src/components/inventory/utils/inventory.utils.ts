import Fuse from 'fuse.js'

import { STUDIOS, capitalise } from 'fizz-kidz'
import type {
    InventoryCategory,
    InventoryQualitativeStockLevel,
    InventoryUnit,
    Studio,
    StudioOrMaster,
} from 'fizz-kidz'

import { getOrgName } from '@utils/studioUtils'

import type {
    ClientInventoryItem,
    ClientInventoryStockLevel,
    SearchableInventoryItem,
    StockAction,
    StockStatusFilter,
} from './inventory.types'

export function getAvailableInventoryLocations(currentOrg: StudioOrMaster | null) {
    if (currentOrg === 'master') {
        return [...STUDIOS]
    }

    return currentOrg ? [currentOrg] : [...STUDIOS]
}

export function getIsRunningLow(item: ClientInventoryItem, stock?: ClientInventoryStockLevel) {
    if (item.$trackingMode === 'qualitative') {
        return stock?.measurement.$type === 'qualitative' && ['low', 'out'].includes(stock.measurement.level)
    }

    if (
        item.runningLowThreshold === null ||
        stock?.measurement.$type !== 'quantity' ||
        stock.measurement.quantity === null
    ) {
        return false
    }

    return stock.measurement.quantity <= item.runningLowThreshold
}

export function getNeedsCount(item: ClientInventoryItem, stock?: ClientInventoryStockLevel) {
    return (
        item.$trackingMode === 'quantity' &&
        stock?.measurement.$type === 'quantity' &&
        stock.measurement.quantity === null
    )
}

export function getStockStatusFilteredItems(
    items: ClientInventoryItem[],
    stockByItemId: Map<string, ClientInventoryStockLevel>,
    filter: StockStatusFilter
) {
    if (filter === 'all') return items

    return items.filter((item) => {
        const stock = stockByItemId.get(item.id)
        if (item.status !== 'active' || !stock?.stocked) return false

        if (filter === 'running-low') return getIsRunningLow(item, stock)
        if (filter === 'needs-count') return getNeedsCount(item, stock)
        return !getIsRunningLow(item, stock) && !getNeedsCount(item, stock)
    })
}

export function getVisibleInventoryItems(items: ClientInventoryItem[], searchQuery: string) {
    if (!searchQuery) return items

    const searchableItems: SearchableInventoryItem[] = items.map((item) => ({
        item,
        name: item.name,
        category: formatCategory(item.category),
        rawCategory: item.category,
        notes: item.notes ?? '',
        unit: item.baseUnit ? formatUnit(item.baseUnit) : '',
        tracking: item.$trackingMode === 'quantity' ? 'exact quantity count' : 'high medium low qualitative',
        status: item.status,
    }))
    const fuse = new Fuse<SearchableInventoryItem>(searchableItems, {
        keys: [
            { name: 'name', weight: 0.55 },
            { name: 'category', weight: 0.15 },
            { name: 'rawCategory', weight: 0.1 },
            { name: 'notes', weight: 0.1 },
            { name: 'unit', weight: 0.05 },
            { name: 'tracking', weight: 0.03 },
            { name: 'status', weight: 0.02 },
        ],
        threshold: 0.35,
        ignoreLocation: true,
    })

    return fuse.search(searchQuery).map(({ item }) => item.item)
}

export function getCurrentQuantity(stock?: ClientInventoryStockLevel) {
    if (stock?.measurement.$type !== 'quantity') {
        return null
    }

    return stock.measurement.quantity
}

export function getCurrentQualitativeLevel(stock?: ClientInventoryStockLevel): InventoryQualitativeStockLevel {
    if (stock?.measurement.$type !== 'qualitative') {
        return 'unknown'
    }

    return stock.measurement.level
}

export function getStockActionTitle(action: StockAction) {
    switch (action.$type) {
        case 'receive':
            return `Receive ${action.item.name}`
        case 'set':
            return `Set stock for ${action.item.name}`
        case 'level':
            return `Update level for ${action.item.name}`
    }
}

export function getStockActionDescription(action: StockAction, location: Studio) {
    switch (action.$type) {
        case 'receive':
            return `Add newly received stock to ${getOrgName(location)}.`
        case 'set':
            return `Enter the actual count at ${getOrgName(location)}. This is the fastest stocktake correction.`
        case 'level':
            return `Set the current high, medium, low, or out level at ${getOrgName(location)}.`
    }
}

export function getStockActionSubmitLabel(action: StockAction) {
    switch (action.$type) {
        case 'receive':
            return 'Receive stock'
        case 'set':
            return 'Set stock count'
        case 'level':
            return 'Update level'
    }
}

export function formatCategory(category: InventoryCategory) {
    return category
        .split('-')
        .map((part) => capitalise(part))
        .join(' ')
}

export function formatUnit(unit: InventoryUnit) {
    return unit === 'kg' || unit === 'g' || unit === 'l' || unit === 'ml' ? unit : capitalise(unit)
}

export function formatQuantityUnit(unit: InventoryUnit | undefined, quantity: number) {
    if (!unit || unit === 'each') {
        return quantity === 1 ? 'unit' : 'units'
    }

    if (unit === 'kg' || unit === 'g' || unit === 'l' || unit === 'ml') {
        return unit
    }

    if (quantity === 1) {
        return unit
    }

    if (unit === 'box') {
        return 'boxes'
    }

    return `${unit}s`
}

export function formatQualitativeLevel(level: InventoryQualitativeStockLevel) {
    return level === 'out' ? 'Out' : capitalise(level)
}

export function pluraliseItem(count: number) {
    return count === 1 ? 'item' : 'items'
}
