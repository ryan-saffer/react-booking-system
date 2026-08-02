import { createInventoryItem, createInventoryItemInputSchema } from '@/inventory/core/inventory.items.create'
import { deleteInventoryItem, deleteInventoryItemInputSchema } from '@/inventory/core/inventory.items.delete'
import { listInventoryItems, listInventoryItemsInputSchema } from '@/inventory/core/inventory.items.list'
import { updateInventoryItem, updateInventoryItemInputSchema } from '@/inventory/core/inventory.items.update'
import {
    generateInventoryShoppingList,
    generateInventoryShoppingListInputSchema,
} from '@/inventory/core/inventory.shopping-list.generate'
import {
    listInventoryStockMovements,
    listInventoryStockMovementsInputSchema,
} from '@/inventory/core/inventory.stock-movements.list'
import { adjustInventoryStock, adjustInventoryStockInputSchema } from '@/inventory/core/inventory.stock.adjust'
import { listInventoryStock, listInventoryStockInputSchema } from '@/inventory/core/inventory.stock.list'
import { setInventoryStocked, setInventoryStockedInputSchema } from '@/inventory/core/inventory.stock.set-stocked'
import {
    createInventoryUsageRule,
    createInventoryUsageRuleInputSchema,
} from '@/inventory/core/inventory.usage-rules.create'
import {
    deleteInventoryUsageRule,
    deleteInventoryUsageRuleInputSchema,
} from '@/inventory/core/inventory.usage-rules.delete'
import {
    listInventoryUsageRules,
    listInventoryUsageRulesInputSchema,
} from '@/inventory/core/inventory.usage-rules.list'
import {
    updateInventoryUsageRule,
    updateInventoryUsageRuleInputSchema,
} from '@/inventory/core/inventory.usage-rules.update'
import { router } from '@/trpc/trpc'

import {
    inventoryLocationReadProcedure,
    inventoryLocationWriteProcedure,
    inventoryReadProcedure,
    inventoryShoppingListProcedure,
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
    listUsageRules: inventoryReadProcedure
        .input(listInventoryUsageRulesInputSchema)
        .query(({ input }) => listInventoryUsageRules(input)),
    createUsageRule: inventoryWriteProcedure
        .input(createInventoryUsageRuleInputSchema)
        .mutation(({ input }) => createInventoryUsageRule(input)),
    updateUsageRule: inventoryWriteProcedure
        .input(updateInventoryUsageRuleInputSchema)
        .mutation(({ input }) => updateInventoryUsageRule(input)),
    deleteUsageRule: inventoryWriteProcedure
        .input(deleteInventoryUsageRuleInputSchema)
        .mutation(({ input }) => deleteInventoryUsageRule(input)),
    generateShoppingList: inventoryShoppingListProcedure
        .input(generateInventoryShoppingListInputSchema)
        .query(({ input }) => generateInventoryShoppingList(input)),
})
