import { z } from 'zod'

import { DatabaseClient } from '@/firebase/DatabaseClient'

import { studioSchema } from './inventory.schemas'

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
