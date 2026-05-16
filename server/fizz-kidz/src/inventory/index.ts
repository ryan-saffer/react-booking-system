import type { Studio } from '../core/studio'

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

export type InventoryCategory = (typeof INVENTORY_CATEGORIES)[number]

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

export type InventoryUnit = (typeof INVENTORY_UNITS)[number]

export const INVENTORY_QUALITATIVE_STOCK_LEVELS = ['unknown', 'out', 'low', 'medium', 'high'] as const

export type InventoryQualitativeStockLevel = (typeof INVENTORY_QUALITATIVE_STOCK_LEVELS)[number]

export type InventoryLocation = Studio

export type InventoryPurchaseOption = {
    label: string
    unit: InventoryUnit
    quantityInBaseUnits: number
    supplier?: string
}

export type BaseInventoryItem = {
    id: string
    name: string
    category: InventoryCategory
    status: 'active' | 'archived'
    purchaseOptions?: InventoryPurchaseOption[]
    notes?: string
    createdAt: Date
    updatedAt: Date
}

export type QuantityTrackedInventoryItem = BaseInventoryItem & {
    $trackingMode: 'quantity'
    baseUnit: InventoryUnit
    /** Count at or below this value should be shown as running low. `null` disables the badge. */
    runningLowThreshold: number | null
}

export type QualitativeInventoryItem = BaseInventoryItem & {
    $trackingMode: 'qualitative'
    baseUnit?: InventoryUnit
}

export type InventoryItem = QuantityTrackedInventoryItem | QualitativeInventoryItem

export type InventoryStockMeasurement =
    | {
          $type: 'quantity'
          /**
           * Exact count for this item at this location. `null` means the count is unknown
           * and someone needs to count it; it is not the same as being out of stock.
           */
          quantity: number | null
      }
    | {
          $type: 'qualitative'
          level: InventoryQualitativeStockLevel
      }

export type InventoryStockLevel = {
    id: string
    itemId: string
    location: InventoryLocation
    /**
     * Whether this studio uses/tracks this item. `false` means the item is unused at this studio,
     * not that the studio has run out of stock. Out-of-stock quantity items use quantity `0`,
     * unknown quantity items use quantity `null`, and qualitative items use measurement level `out`.
     */
    stocked: boolean
    measurement: InventoryStockMeasurement
    reorderPoint?: number
    parLevel?: number
    reorderLevel?: InventoryQualitativeStockLevel
    targetLevel?: InventoryQualitativeStockLevel
    lastMovementAt?: Date
    updatedAt: Date
}

export const INVENTORY_STOCK_MOVEMENT_SOURCES = [
    'manual-adjustment',
    'stocktake',
    'booking-usage',
    'purchase',
    'transfer',
    'system',
] as const

export type InventoryStockMovementSource = (typeof INVENTORY_STOCK_MOVEMENT_SOURCES)[number]

export type InventoryStockMovementAdjustment =
    | {
          $type: 'quantity'
          $operation: 'adjust'
          delta: number
          quantityBefore: number
          quantityAfter: number
      }
    | {
          $type: 'quantity'
          $operation: 'set'
          quantityBefore: number | null
          quantityAfter: number | null
      }
    | {
          $type: 'qualitative'
          levelBefore: InventoryQualitativeStockLevel
          levelAfter: InventoryQualitativeStockLevel
      }

export type InventoryStockMovement = {
    id: string
    itemId: string
    location: InventoryLocation
    source: InventoryStockMovementSource
    adjustment: InventoryStockMovementAdjustment
    reason?: string
    createdAt: Date
    createdBy: {
        uid: string
        email: string
    }
}

export function getInventoryStockLevelId(location: Studio, itemId: string) {
    return `${location}_${itemId}`
}
