import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { useConfirm } from '@components/Hooks/confirmation-dialog.tsx/use-confirmation-dialog'
import { useTRPC } from '@utils/trpc'

import { useInventoryLocation } from './use-inventory-location'
import { useInventoryStore } from '../state/inventory-store'

import type { InventoryItemFormValues, StockActionFormValues } from '../form-schemas'
import type { ClientInventoryItem } from '../types'

export function useInventoryActions() {
    const trpc = useTRPC()
    const queryClient = useQueryClient()
    const confirm = useConfirm()
    const { location } = useInventoryLocation()
    const editingItem = useInventoryStore((state) => state.editingItem)
    const stockAction = useInventoryStore((state) => state.stockAction)
    const setCreateDialogOpen = useInventoryStore((state) => state.setCreateDialogOpen)
    const closeEditDialog = useInventoryStore((state) => state.closeEditDialog)
    const closeStockActionDialog = useInventoryStore((state) => state.closeStockActionDialog)
    const openEditDialog = useInventoryStore((state) => state.openEditDialog)

    const createItemMutation = useMutation(
        trpc.inventory.createItem.mutationOptions({
            onSuccess: async () => {
                toast.success('Inventory item created.')
                setCreateDialogOpen(false)
                await Promise.all([
                    queryClient.invalidateQueries({ queryKey: trpc.inventory.listItems.queryKey() }),
                    queryClient.invalidateQueries({ queryKey: trpc.inventory.listStock.queryKey({ location }) }),
                ])
            },
            onError: () => toast.error('Unable to create inventory item.'),
        })
    )

    const updateItemMutation = useMutation(
        trpc.inventory.updateItem.mutationOptions({
            onSuccess: async () => {
                toast.success('Inventory item updated.')
                closeEditDialog()
                await queryClient.invalidateQueries({ queryKey: trpc.inventory.listItems.queryKey() })
            },
            onError: () => toast.error('Unable to update inventory item.'),
        })
    )

    const adjustStockMutation = useMutation(
        trpc.inventory.adjustStock.mutationOptions({
            onSuccess: async () => {
                toast.success('Stock level updated.')
                closeStockActionDialog()
                await queryClient.invalidateQueries({ queryKey: trpc.inventory.listStock.queryKey({ location }) })
            },
            onError: (error) => toast.error(error.message || 'Unable to update stock level.'),
        })
    )

    const deleteItemMutation = useMutation(
        trpc.inventory.deleteItem.mutationOptions({
            onSuccess: async () => {
                toast.success('Inventory item deleted.')
                closeEditDialog()
                await Promise.all([
                    queryClient.invalidateQueries({ queryKey: trpc.inventory.listItems.queryKey() }),
                    queryClient.invalidateQueries({ queryKey: trpc.inventory.listStock.queryKey() }),
                ])
            },
            onError: () => toast.error('Unable to delete inventory item.'),
        })
    )

    const setStockedMutation = useMutation(
        trpc.inventory.setStocked.mutationOptions({
            onSuccess: async (_, input) => {
                toast.success(input.stocked ? 'Item is now tracked here.' : 'Item marked unused here.')
                await queryClient.invalidateQueries({ queryKey: trpc.inventory.listStock.queryKey({ location }) })
            },
            onError: () => toast.error('Unable to update studio tracking.'),
        })
    )

    const createItem = async (values: InventoryItemFormValues) => {
        const common = {
            name: values.name,
            category: values.category,
            status: values.status,
            notes: values.notes || undefined,
        }

        if (values.$trackingMode === 'quantity') {
            await createItemMutation.mutateAsync({
                ...common,
                $trackingMode: 'quantity',
                baseUnit: values.baseUnit,
                runningLowThreshold: values.runningLowThreshold,
            })
            return
        }

        await createItemMutation.mutateAsync({
            ...common,
            $trackingMode: 'qualitative',
            baseUnit: values.baseUnit,
        })
    }

    const updateItem = async (values: InventoryItemFormValues) => {
        if (!editingItem) return

        const common = {
            name: values.name,
            category: values.category,
            status: values.status,
            purchaseOptions: editingItem.purchaseOptions,
            notes: values.notes || undefined,
        }

        if (values.$trackingMode === 'quantity') {
            await updateItemMutation.mutateAsync({
                itemId: editingItem.id,
                item: {
                    ...common,
                    $trackingMode: 'quantity',
                    baseUnit: values.baseUnit,
                    runningLowThreshold: values.runningLowThreshold,
                },
            })
            return
        }

        await updateItemMutation.mutateAsync({
            itemId: editingItem.id,
            item: {
                ...common,
                $trackingMode: 'qualitative',
                baseUnit: values.baseUnit,
            },
        })
    }

    const deleteItem = async () => {
        if (!editingItem) return

        const itemToDelete = editingItem
        closeEditDialog()

        const confirmed = await confirm({
            title: `Delete ${itemToDelete.name} everywhere?`,
            description:
                'This will delete the item, all studio stock levels, and all stock movement history for this item.',
        })
        if (!confirmed) {
            openEditDialog(itemToDelete)
            return
        }

        await deleteItemMutation.mutateAsync({ itemId: itemToDelete.id })
    }

    const setItemStocked = async (item: ClientInventoryItem, stocked: boolean) => {
        await setStockedMutation.mutateAsync({ itemId: item.id, location, stocked })
    }

    const adjustStock = async (values: StockActionFormValues) => {
        if (!stockAction) return

        const reason = values.reason || undefined

        if (stockAction.$type === 'level') {
            await adjustStockMutation.mutateAsync({
                itemId: stockAction.item.id,
                location,
                stocked: true,
                adjustment: {
                    $type: 'qualitative',
                    level: values.level,
                },
                source: 'stocktake',
                reason,
            })
            return
        }

        if (stockAction.$type === 'receive') {
            await adjustStockMutation.mutateAsync({
                itemId: stockAction.item.id,
                location,
                stocked: true,
                adjustment: {
                    $type: 'quantity',
                    $operation: 'adjust',
                    delta: values.quantity,
                },
                source: 'purchase',
                reason,
            })
            return
        }

        await adjustStockMutation.mutateAsync({
            itemId: stockAction.item.id,
            location,
            stocked: true,
            adjustment: {
                $type: 'quantity',
                $operation: 'set',
                quantity: values.quantity,
            },
            source: 'stocktake',
            reason,
        })
    }

    const markQuantityUnknown = async (item: ClientInventoryItem) => {
        await adjustStockMutation.mutateAsync({
            itemId: item.id,
            location,
            stocked: true,
            adjustment: {
                $type: 'quantity',
                $operation: 'set',
                quantity: null,
            },
            source: 'stocktake',
            reason: 'Marked count unknown.',
        })
    }

    return {
        isAdjustStockPending: adjustStockMutation.isPending,
        isCreatingItem: createItemMutation.isPending,
        isDeletingItem: deleteItemMutation.isPending,
        isSetStockedPending: setStockedMutation.isPending,
        isUpdatingItem: updateItemMutation.isPending,
        adjustStock,
        createItem,
        deleteItem,
        markQuantityUnknown,
        setItemStocked,
        updateItem,
    }
}
