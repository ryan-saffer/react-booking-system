import { STUDIOS, getInventoryStockLevelId } from 'fizz-kidz'
import type { InventoryItem, InventoryStockLevel } from 'fizz-kidz'

import { DatabaseClient } from '@/firebase/DatabaseClient'

import { inventoryItemInputSchema } from './inventory.schemas'

import type { z } from 'zod'

export const createInventoryItemInputSchema = inventoryItemInputSchema

export type CreateInventoryItemInput = z.infer<typeof createInventoryItemInputSchema>

export async function createInventoryItem(input: CreateInventoryItemInput) {
    const now = new Date()
    const itemId = await DatabaseClient.createInventoryItemId()
    const item: InventoryItem = {
        ...input,
        id: itemId,
        createdAt: now,
        updatedAt: now,
    }
    const stockLevels: InventoryStockLevel[] = STUDIOS.map((location) => ({
        id: getInventoryStockLevelId(location, itemId),
        itemId,
        location,
        stocked: true,
        measurement:
            item.$trackingMode === 'quantity'
                ? { $type: 'quantity', quantity: null }
                : { $type: 'qualitative', level: 'unknown' },
        updatedAt: now,
    }))

    await DatabaseClient.setInventoryDocuments({ items: [item], stockLevels })

    return DatabaseClient.getInventoryItem(itemId)
}
