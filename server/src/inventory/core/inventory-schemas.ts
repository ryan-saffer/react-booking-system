import { z } from 'zod'

import {
    INVENTORY_CATEGORIES,
    INVENTORY_QUALITATIVE_STOCK_LEVELS,
    INVENTORY_STOCK_MOVEMENT_SOURCES,
    INVENTORY_UNITS,
    STUDIOS,
} from 'fizz-kidz'
import type { Studio } from 'fizz-kidz'

export const studioSchema = z.custom<Studio>((value) => typeof value === 'string' && STUDIOS.includes(value as Studio))

export const inventoryCategorySchema = z.enum(INVENTORY_CATEGORIES)
export const inventoryUnitSchema = z.enum(INVENTORY_UNITS)
export const qualitativeStockLevelSchema = z.enum(INVENTORY_QUALITATIVE_STOCK_LEVELS)
export const inventoryStockMovementSourceSchema = z.enum(INVENTORY_STOCK_MOVEMENT_SOURCES)

export const inventoryPurchaseOptionSchema = z.object({
    label: z.string().min(1),
    unit: inventoryUnitSchema,
    quantityInBaseUnits: z.number().positive(),
    supplier: z.string().optional(),
})

export const inventoryItemInputSchema = z.discriminatedUnion('$trackingMode', [
    z.object({
        $trackingMode: z.literal('quantity'),
        name: z.string().min(1),
        category: inventoryCategorySchema,
        status: z.enum(['active', 'archived']).default('active'),
        baseUnit: inventoryUnitSchema,
        runningLowThreshold: z.number().nonnegative().nullable(),
        purchaseOptions: z.array(inventoryPurchaseOptionSchema).optional(),
        notes: z.string().optional(),
    }),
    z.object({
        $trackingMode: z.literal('qualitative'),
        name: z.string().min(1),
        category: inventoryCategorySchema,
        status: z.enum(['active', 'archived']).default('active'),
        baseUnit: inventoryUnitSchema.optional(),
        purchaseOptions: z.array(inventoryPurchaseOptionSchema).optional(),
        notes: z.string().optional(),
    }),
])

export const inventoryStockAdjustmentInputSchema = z.union([
    z.object({
        $type: z.literal('quantity'),
        $operation: z.literal('adjust'),
        delta: z.number(),
    }),
    z.object({
        $type: z.literal('quantity'),
        $operation: z.literal('set'),
        quantity: z.number().nonnegative().nullable(),
    }),
    z.object({
        $type: z.literal('qualitative'),
        level: qualitativeStockLevelSchema,
    }),
])
