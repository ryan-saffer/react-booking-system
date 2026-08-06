import { z } from 'zod'

import { studioSchema } from './inventory.schemas'

import { DatabaseClient } from '@/integrations/firebase/database.client'

export const listInventoryStockInputSchema = z
    .object({
        location: studioSchema.optional(),
        itemId: z.string().optional(),
    })
    .optional()

export type ListInventoryStockInput = z.infer<typeof listInventoryStockInputSchema>

export async function listInventoryStock(input: ListInventoryStockInput) {
    return DatabaseClient.listInventoryStockLevels({
        location: input?.location,
        itemId: input?.itemId,
    })
}
