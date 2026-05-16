import { z } from 'zod'

import { DatabaseClient } from '@/firebase/DatabaseClient'

import { studioSchema } from './inventory-schemas'

export const setInventoryStockedInputSchema = z.object({
    itemId: z.string().min(1),
    location: studioSchema,
    stocked: z.boolean(),
})

export type SetInventoryStockedInput = z.infer<typeof setInventoryStockedInputSchema>

export async function setInventoryStocked(input: SetInventoryStockedInput) {
    const stockLevel = await DatabaseClient.getInventoryStockLevel({ itemId: input.itemId, location: input.location })
    if (!stockLevel) {
        throw new Error(`Inventory stock level '${input.location}_${input.itemId}' does not exist`)
    }

    await DatabaseClient.updateInventoryStockLevel({
        itemId: input.itemId,
        location: input.location,
        stockLevel: {
            stocked: input.stocked,
            updatedAt: new Date(),
        },
    })

    return DatabaseClient.getInventoryStockLevel({ itemId: input.itemId, location: input.location })
}
