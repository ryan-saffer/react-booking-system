import { FieldValue } from 'firebase-admin/firestore'
import { z } from 'zod'

import { DatabaseClient } from '@/firebase/DatabaseClient'

import {
    inventoryCategorySchema,
    inventoryKeySchema,
    inventoryPurchaseOptionSchema,
    inventoryUnitSchema,
} from './inventory.schemas'

export const updateInventoryItemInputSchema = z.object({
    itemId: z.string().min(1),
    item: z.union([
        z.object({
            $trackingMode: z.literal('quantity'),
            name: z.string().min(1).optional(),
            inventoryKey: inventoryKeySchema.nullable().optional(),
            category: inventoryCategorySchema.optional(),
            status: z.enum(['active', 'archived']).optional(),
            baseUnit: inventoryUnitSchema,
            runningLowThreshold: z.number().nonnegative().nullable(),
            purchaseOptions: z.array(inventoryPurchaseOptionSchema).optional(),
            notes: z.string().optional(),
        }),
        z.object({
            $trackingMode: z.literal('qualitative'),
            name: z.string().min(1).optional(),
            inventoryKey: inventoryKeySchema.nullable().optional(),
            category: inventoryCategorySchema.optional(),
            status: z.enum(['active', 'archived']).optional(),
            baseUnit: inventoryUnitSchema.optional(),
            purchaseOptions: z.array(inventoryPurchaseOptionSchema).optional(),
            notes: z.string().optional(),
        }),
        z.object({
            name: z.string().min(1).optional(),
            inventoryKey: inventoryKeySchema.nullable().optional(),
            category: inventoryCategorySchema.optional(),
            status: z.enum(['active', 'archived']).optional(),
            purchaseOptions: z.array(inventoryPurchaseOptionSchema).optional(),
            notes: z.string().optional(),
        }),
    ]),
})

export type UpdateInventoryItemInput = z.infer<typeof updateInventoryItemInputSchema>

export async function updateInventoryItem(input: UpdateInventoryItemInput) {
    const itemUpdate = {
        ...input.item,
        inventoryKey: input.item.inventoryKey === null ? FieldValue.delete() : input.item.inventoryKey,
        updatedAt: new Date(),
    }

    await DatabaseClient.updateInventoryItem(input.itemId, {
        ...itemUpdate,
    })

    return DatabaseClient.getInventoryItem(input.itemId)
}
