import { z } from 'zod'

import { DatabaseClient } from '@/firebase/DatabaseClient'

import { inventoryCategorySchema, inventoryPurchaseOptionSchema, inventoryUnitSchema } from './inventory-schemas'

export const updateInventoryItemInputSchema = z.object({
    itemId: z.string().min(1),
    item: z.union([
        z.object({
            $trackingMode: z.literal('quantity'),
            name: z.string().min(1).optional(),
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
            category: inventoryCategorySchema.optional(),
            status: z.enum(['active', 'archived']).optional(),
            baseUnit: inventoryUnitSchema.optional(),
            purchaseOptions: z.array(inventoryPurchaseOptionSchema).optional(),
            notes: z.string().optional(),
        }),
        z.object({
            name: z.string().min(1).optional(),
            category: inventoryCategorySchema.optional(),
            status: z.enum(['active', 'archived']).optional(),
            purchaseOptions: z.array(inventoryPurchaseOptionSchema).optional(),
            notes: z.string().optional(),
        }),
    ]),
})

export type UpdateInventoryItemInput = z.infer<typeof updateInventoryItemInputSchema>

export async function updateInventoryItem(input: UpdateInventoryItemInput) {
    await DatabaseClient.updateInventoryItem(input.itemId, {
        ...input.item,
        updatedAt: new Date(),
    })

    return DatabaseClient.getInventoryItem(input.itemId)
}
