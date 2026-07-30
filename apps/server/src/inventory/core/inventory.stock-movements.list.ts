import { z } from 'zod'

import { DatabaseClient } from '@/firebase/DatabaseClient'

import { studioSchema } from './inventory.schemas'

export const listInventoryStockMovementsInputSchema = z
    .object({
        location: studioSchema.optional(),
        itemId: z.string().optional(),
        limit: z.number().int().positive().max(500).optional(),
    })
    .optional()

export type ListInventoryStockMovementsInput = z.infer<typeof listInventoryStockMovementsInputSchema>

export async function listInventoryStockMovements(input: ListInventoryStockMovementsInput) {
    return DatabaseClient.listInventoryStockMovements({
        location: input?.location,
        itemId: input?.itemId,
        limit: input?.limit ?? 100,
    })
}
