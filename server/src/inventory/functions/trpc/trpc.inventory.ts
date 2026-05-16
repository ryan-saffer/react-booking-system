import { adjustInventoryStock, adjustInventoryStockInputSchema } from '@/inventory/core/adjust-inventory-stock'
import { createInventoryItem, createInventoryItemInputSchema } from '@/inventory/core/create-inventory-item'
import { deleteInventoryItem, deleteInventoryItemInputSchema } from '@/inventory/core/delete-inventory-item'
import { listInventoryItems, listInventoryItemsInputSchema } from '@/inventory/core/list-inventory-items'
import { listInventoryStock, listInventoryStockInputSchema } from '@/inventory/core/list-inventory-stock'
import {
    listInventoryStockMovements,
    listInventoryStockMovementsInputSchema,
} from '@/inventory/core/list-inventory-stock-movements'
import { setInventoryStocked, setInventoryStockedInputSchema } from '@/inventory/core/set-inventory-stocked'
import { updateInventoryItem, updateInventoryItemInputSchema } from '@/inventory/core/update-inventory-item'
import { router } from '@/trpc/trpc'

import {
    inventoryLocationReadProcedure,
    inventoryLocationWriteProcedure,
    inventoryReadProcedure,
    inventoryWriteProcedure,
} from './trpc.inventory-procedures'

export const inventoryRouter = router({
    listItems: inventoryReadProcedure
        .input(listInventoryItemsInputSchema)
        .query(({ input }) => listInventoryItems(input)),
    createItem: inventoryWriteProcedure
        .input(createInventoryItemInputSchema)
        .mutation(({ input }) => createInventoryItem(input)),
    updateItem: inventoryWriteProcedure
        .input(updateInventoryItemInputSchema)
        .mutation(({ input }) => updateInventoryItem(input)),
    deleteItem: inventoryWriteProcedure
        .input(deleteInventoryItemInputSchema)
        .mutation(({ input }) => deleteInventoryItem(input)),
    listStock: inventoryLocationReadProcedure
        .input(listInventoryStockInputSchema)
        .query(({ input }) => listInventoryStock(input)),
    adjustStock: inventoryLocationWriteProcedure
        .input(adjustInventoryStockInputSchema)
        .mutation(({ ctx, input }) => adjustInventoryStock(input, { uid: ctx.uid, email: ctx.email })),
    setStocked: inventoryLocationWriteProcedure
        .input(setInventoryStockedInputSchema)
        .mutation(({ input }) => setInventoryStocked(input)),
    listMovements: inventoryLocationReadProcedure
        .input(listInventoryStockMovementsInputSchema)
        .query(({ input }) => listInventoryStockMovements(input)),
})
