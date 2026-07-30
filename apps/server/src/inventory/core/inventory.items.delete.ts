import { z } from 'zod'

import { DatabaseClient } from '@/firebase/DatabaseClient'

export const deleteInventoryItemInputSchema = z.object({
    itemId: z.string().min(1),
})

export type DeleteInventoryItemInput = z.infer<typeof deleteInventoryItemInputSchema>

export async function deleteInventoryItem(input: DeleteInventoryItemInput) {
    const [stockLevels, stockMovements] = await Promise.all([
        DatabaseClient.listInventoryStockLevels({ itemId: input.itemId }),
        DatabaseClient.listInventoryStockMovements({ itemId: input.itemId }),
    ])

    await DatabaseClient.deleteInventoryDocuments({
        itemIds: [input.itemId],
        stockLevelIds: stockLevels.map((stockLevel) => stockLevel.id),
        stockMovementIds: stockMovements.map((stockMovement) => stockMovement.id),
    })
}
