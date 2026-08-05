import { z } from 'zod'

import { DatabaseClient } from '@/integrations/firebase/database.client'

import { inventoryCategorySchema } from './inventory.schemas'

export const listInventoryItemsInputSchema = z
    .object({
        includeArchived: z.boolean().optional(),
        category: inventoryCategorySchema.optional(),
    })
    .optional()

export type ListInventoryItemsInput = z.infer<typeof listInventoryItemsInputSchema>

export async function listInventoryItems(input: ListInventoryItemsInput) {
    return DatabaseClient.listInventoryItems({
        includeArchived: input?.includeArchived,
        category: input?.category,
    })
}
