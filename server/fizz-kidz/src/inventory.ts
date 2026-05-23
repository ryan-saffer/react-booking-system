import type { Studio } from './core/studio'
import type { InventoryUsageRuleType } from './inventory.types'

export const INVENTORY_CATEGORIES = [
    'party-food',
    'paint',
    'glitter',
    'glue',
    'pigment',
    'soap-and-bath',
    'bath-bombs',
    'fragrance-and-dye',
    'decorations',
    'cleaning',
    'packaging',
    'other',
] as const

export const INVENTORY_UNITS = [
    'each',
    'serve',
    'pack',
    'box',
    'tray',
    'bag',
    'bottle',
    'container',
    'bucket',
    'can',
    'jar',
    'tub',
    'kg',
    'g',
    'l',
    'ml',
] as const

export const INVENTORY_QUALITATIVE_STOCK_LEVELS = ['unknown', 'out', 'low', 'medium', 'high'] as const

export const INVENTORY_STOCK_MOVEMENT_SOURCES = [
    'manual-adjustment',
    'stocktake',
    'booking-usage',
    'purchase',
    'transfer',
    'system',
] as const

export const INVENTORY_USAGE_RULE_TYPES = ['party-base', 'party-food-package', 'party-addition'] as const

export function getInventoryStockLevelId(location: Studio, itemId: string) {
    return `${location}_${itemId}`
}

export function getInventoryUsageRuleInventoryKey(type: InventoryUsageRuleType, name: string) {
    return `${type}:${name.trim()}`
}

export function parseInventoryUsageRuleInventoryKey(inventoryKey: string | undefined) {
    if (!inventoryKey) return undefined

    const separatorIndex = inventoryKey.indexOf(':')
    if (separatorIndex === -1) return undefined

    const type = inventoryKey.slice(0, separatorIndex)
    const name = inventoryKey.slice(separatorIndex + 1)
    if (!INVENTORY_USAGE_RULE_TYPES.includes(type as InventoryUsageRuleType) || !name) return undefined

    return { $type: type as InventoryUsageRuleType, name }
}

export type * from './inventory.types'
