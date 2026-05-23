// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useInventoryActions } from './use-inventory-actions'
import { useInventoryStore } from '../state/inventory-store'

import type {
    InventoryItemFormValues,
    StockActionFormValues,
    UsageRuleFormValues,
} from '../utils/inventory.form-schemas'
import type { ClientInventoryItem, ClientInventoryStockLevel, ClientInventoryUsageRule } from '../utils/inventory.types'

const mocks = vi.hoisted(() => ({
    confirm: vi.fn(),
    invalidateQueries: vi.fn(async () => undefined),
    mutationCalls: [] as { input: unknown; name: string }[],
    mutationOptionsByName: new Map<string, any>(),
    toastError: vi.fn(),
    toastSuccess: vi.fn(),
}))

vi.mock('@tanstack/react-query', () => ({
    useMutation: (options: any) => {
        mocks.mutationOptionsByName.set(options.name, options)
        return {
            isPending: false,
            mutateAsync: async (input: unknown) => {
                mocks.mutationCalls.push({ input, name: options.name })
                await options.onSuccess?.(undefined, input)
            },
        }
    },
    useQueryClient: () => ({ invalidateQueries: mocks.invalidateQueries }),
}))

vi.mock('sonner', () => ({
    toast: {
        error: mocks.toastError,
        success: mocks.toastSuccess,
    },
}))

vi.mock('@components/Hooks/confirmation-dialog.tsx/use-confirmation-dialog', () => ({
    useConfirm: () => mocks.confirm,
}))

vi.mock('./use-inventory-location', () => ({
    useInventoryLocation: () => ({ location: 'balwyn' }),
}))

function mutation(name: string) {
    return {
        mutationOptions: (options: Record<string, unknown>) => ({ ...options, name }),
    }
}

function query(name: string) {
    return {
        queryKey: (input?: unknown) => [name, input],
    }
}

vi.mock('@utils/trpc', () => ({
    useTRPC: () => ({
        inventory: {
            adjustStock: mutation('adjustStock'),
            createItem: mutation('createItem'),
            createUsageRule: mutation('createUsageRule'),
            deleteItem: mutation('deleteItem'),
            deleteUsageRule: mutation('deleteUsageRule'),
            generateShoppingList: query('generateShoppingList'),
            listItems: query('listItems'),
            listStock: query('listStock'),
            listUsageRules: query('listUsageRules'),
            setStocked: mutation('setStocked'),
            updateItem: mutation('updateItem'),
            updateUsageRule: mutation('updateUsageRule'),
        },
    }),
}))

const now = new Date('2026-05-01T00:00:00.000Z')

const item: ClientInventoryItem = {
    id: 'item-1',
    name: 'Party pies',
    inventoryKey: 'party-base:partyPies',
    category: 'party-food',
    status: 'active',
    $trackingMode: 'quantity',
    baseUnit: 'each',
    runningLowThreshold: 10,
    minimumTargetQuantity: 20,
    purchaseOptions: [{ label: 'Box', unit: 'box', quantityInBaseUnits: 24 }],
    createdAt: now,
    updatedAt: now,
}

const stock: ClientInventoryStockLevel = {
    id: 'stock-1',
    itemId: 'item-1',
    location: 'balwyn',
    stocked: true,
    measurement: { $type: 'quantity', quantity: 4 },
    updatedAt: now,
}

const usageRule: ClientInventoryUsageRule = {
    id: 'rule-1',
    $type: 'party-base',
    inventoryKey: 'party-base:partyPies',
    label: 'Party pies',
    status: 'active',
    quantity: { $operation: 'fixed', quantity: 2 },
    createdAt: now,
    updatedAt: now,
}

const quantityValues: InventoryItemFormValues = {
    $trackingMode: 'quantity',
    name: 'Party pies',
    inventoryKeyType: 'party-base',
    inventoryKeyName: 'partyPies',
    inventoryKey: 'party-base:partyPies',
    category: 'party-food',
    baseUnit: 'each',
    runningLowThreshold: 10,
    minimumTargetQuantity: 20,
    status: 'active',
    notes: '',
}

const qualitativeValues: InventoryItemFormValues = {
    $trackingMode: 'qualitative',
    name: 'Glitter',
    inventoryKeyType: 'party-base',
    inventoryKeyName: '',
    inventoryKey: null,
    category: 'glitter',
    baseUnit: 'tub',
    runningLowThreshold: null,
    minimumTargetQuantity: null,
    status: 'active',
    notes: 'Sparkle',
}

const usageRuleValues: UsageRuleFormValues = {
    $type: 'party-base',
    name: 'partyPies',
    label: 'Party pies',
    status: 'active',
    quantity: { $operation: 'fixed', quantity: 2 },
    notes: undefined,
}

async function callAction(action: () => Promise<void>) {
    await act(async () => {
        await action()
    })
}

describe('useInventoryActions', () => {
    beforeEach(() => {
        mocks.confirm.mockReset()
        mocks.invalidateQueries.mockClear()
        mocks.mutationCalls.length = 0
        mocks.mutationOptionsByName.clear()
        mocks.toastError.mockClear()
        mocks.toastSuccess.mockClear()
        useInventoryStore.setState({ editingItem: null, editingUsageRule: null, stockAction: null })
    })

    it('creates and updates quantity and qualitative items', async () => {
        useInventoryStore.setState({ editingItem: item })
        const { rerender, result } = renderHook(() => useInventoryActions())

        await callAction(() => result.current.createItem(quantityValues))
        await callAction(() => result.current.createItem(qualitativeValues))
        await callAction(() => result.current.updateItem(quantityValues))
        useInventoryStore.setState({ editingItem: item })
        rerender()
        await callAction(() => result.current.updateItem(qualitativeValues))

        expect(mocks.mutationCalls).toEqual([
            {
                name: 'createItem',
                input: {
                    $trackingMode: 'quantity',
                    baseUnit: 'each',
                    category: 'party-food',
                    inventoryKey: 'party-base:partyPies',
                    name: 'Party pies',
                    notes: undefined,
                    runningLowThreshold: 10,
                    minimumTargetQuantity: 20,
                    status: 'active',
                },
            },
            {
                name: 'createItem',
                input: {
                    $trackingMode: 'qualitative',
                    baseUnit: 'tub',
                    category: 'glitter',
                    inventoryKey: undefined,
                    name: 'Glitter',
                    notes: 'Sparkle',
                    status: 'active',
                },
            },
            {
                name: 'updateItem',
                input: {
                    item: {
                        $trackingMode: 'quantity',
                        baseUnit: 'each',
                        category: 'party-food',
                        inventoryKey: 'party-base:partyPies',
                        name: 'Party pies',
                        notes: undefined,
                        purchaseOptions: item.purchaseOptions,
                        runningLowThreshold: 10,
                        minimumTargetQuantity: 20,
                        status: 'active',
                    },
                    itemId: 'item-1',
                },
            },
            {
                name: 'updateItem',
                input: {
                    item: {
                        $trackingMode: 'qualitative',
                        baseUnit: 'tub',
                        category: 'glitter',
                        inventoryKey: null,
                        name: 'Glitter',
                        notes: 'Sparkle',
                        purchaseOptions: item.purchaseOptions,
                        status: 'active',
                    },
                    itemId: 'item-1',
                },
            },
        ])
        expect(mocks.toastSuccess).toHaveBeenCalledWith('Inventory item created.')
        expect(mocks.toastSuccess).toHaveBeenCalledWith('Inventory item updated.')
    })

    it('skips item and usage-rule updates when nothing is selected', async () => {
        const { result } = renderHook(() => useInventoryActions())

        await callAction(() => result.current.updateItem(quantityValues))
        await callAction(() => result.current.updateUsageRule(usageRuleValues))
        await callAction(() => result.current.deleteItem())
        await callAction(() => result.current.deleteUsageRule())
        await callAction(() => result.current.adjustStock({ quantity: 1, level: 'high', reason: '' }))

        expect(mocks.mutationCalls).toEqual([])
    })

    it('confirms destructive item and usage-rule deletes', async () => {
        mocks.confirm
            .mockResolvedValueOnce(false)
            .mockResolvedValueOnce(true)
            .mockResolvedValueOnce(false)
            .mockResolvedValueOnce(true)
        useInventoryStore.setState({ editingItem: item, editingUsageRule: usageRule })
        const { result } = renderHook(() => useInventoryActions())

        await callAction(() => result.current.deleteItem())
        expect(useInventoryStore.getState().editingItem?.id).toBe('item-1')

        await callAction(() => result.current.deleteItem())
        await callAction(() => result.current.deleteUsageRule())
        expect(useInventoryStore.getState().editingUsageRule?.id).toBe('rule-1')

        await callAction(() => result.current.deleteUsageRule())

        expect(mocks.confirm).toHaveBeenCalledWith({
            title: 'Delete Party pies everywhere?',
            description:
                'This will delete the item, all studio stock levels, and all stock movement history for this item.',
        })
        expect(mocks.confirm).toHaveBeenCalledWith({
            title: 'Delete usage rule Party pies?',
            description: 'This removes the rule from future shopping-list generation. It does not change stock counts.',
        })
        expect(mocks.mutationCalls).toEqual([
            { name: 'deleteItem', input: { itemId: 'item-1' } },
            { name: 'deleteUsageRule', input: { ruleId: 'rule-1' } },
        ])
    })

    it('creates, updates, and deletes usage rules', async () => {
        useInventoryStore.setState({ editingUsageRule: usageRule })
        const { result } = renderHook(() => useInventoryActions())

        await callAction(() => result.current.createUsageRule(usageRuleValues))
        await callAction(() => result.current.updateUsageRule(usageRuleValues))

        expect(mocks.mutationCalls).toEqual([
            { name: 'createUsageRule', input: usageRuleValues },
            { name: 'updateUsageRule', input: { ruleId: 'rule-1', rule: usageRuleValues } },
        ])
    })

    it('adjusts quantity, qualitative, stocked, and unknown stock states', async () => {
        const { result, rerender } = renderHook(() => useInventoryActions())

        useInventoryStore.setState({ stockAction: { $type: 'level', item, stock } })
        rerender()
        await callAction(() => result.current.adjustStock({ quantity: 0, level: 'low', reason: '' }))

        useInventoryStore.setState({ stockAction: { $type: 'receive', item, stock } })
        rerender()
        await callAction(() => result.current.adjustStock({ quantity: 3, level: 'unknown', reason: 'Delivery' }))

        useInventoryStore.setState({ stockAction: { $type: 'set', item, stock } })
        rerender()
        const setValues: StockActionFormValues = { quantity: 7, level: 'unknown', reason: 'Counted' }
        await callAction(() => result.current.adjustStock(setValues))
        await callAction(() => result.current.setItemStocked(item, false))
        await callAction(() => result.current.setItemStocked(item, true))
        await callAction(() => result.current.markQuantityUnknown(item))

        expect(mocks.mutationCalls).toEqual([
            {
                name: 'adjustStock',
                input: {
                    adjustment: { $type: 'qualitative', level: 'low' },
                    itemId: 'item-1',
                    location: 'balwyn',
                    reason: undefined,
                    source: 'stocktake',
                    stocked: true,
                },
            },
            {
                name: 'adjustStock',
                input: {
                    adjustment: { $operation: 'adjust', $type: 'quantity', delta: 3 },
                    itemId: 'item-1',
                    location: 'balwyn',
                    reason: 'Delivery',
                    source: 'purchase',
                    stocked: true,
                },
            },
            {
                name: 'adjustStock',
                input: {
                    adjustment: { $operation: 'set', $type: 'quantity', quantity: 7 },
                    itemId: 'item-1',
                    location: 'balwyn',
                    reason: 'Counted',
                    source: 'stocktake',
                    stocked: true,
                },
            },
            { name: 'setStocked', input: { itemId: 'item-1', location: 'balwyn', stocked: false } },
            { name: 'setStocked', input: { itemId: 'item-1', location: 'balwyn', stocked: true } },
            {
                name: 'adjustStock',
                input: {
                    adjustment: { $operation: 'set', $type: 'quantity', quantity: null },
                    itemId: 'item-1',
                    location: 'balwyn',
                    reason: 'Marked count unknown.',
                    source: 'stocktake',
                    stocked: true,
                },
            },
        ])
    })

    it('shows mutation error toasts', () => {
        renderHook(() => useInventoryActions())

        mocks.mutationOptionsByName.get('createItem').onError()
        mocks.mutationOptionsByName.get('updateItem').onError()
        mocks.mutationOptionsByName.get('adjustStock').onError(new Error('Stock failed'))
        mocks.mutationOptionsByName.get('adjustStock').onError({ message: '' })
        mocks.mutationOptionsByName.get('deleteItem').onError()
        mocks.mutationOptionsByName.get('setStocked').onError()
        mocks.mutationOptionsByName.get('createUsageRule').onError(new Error('Create failed'))
        mocks.mutationOptionsByName.get('createUsageRule').onError({ message: '' })
        mocks.mutationOptionsByName.get('updateUsageRule').onError(new Error('Update failed'))
        mocks.mutationOptionsByName.get('updateUsageRule').onError({ message: '' })
        mocks.mutationOptionsByName.get('deleteUsageRule').onError()

        expect(mocks.toastError).toHaveBeenCalledWith('Unable to create inventory item.')
        expect(mocks.toastError).toHaveBeenCalledWith('Unable to update inventory item.')
        expect(mocks.toastError).toHaveBeenCalledWith('Stock failed')
        expect(mocks.toastError).toHaveBeenCalledWith('Unable to update stock level.')
        expect(mocks.toastError).toHaveBeenCalledWith('Unable to delete inventory item.')
        expect(mocks.toastError).toHaveBeenCalledWith('Unable to update studio tracking.')
        expect(mocks.toastError).toHaveBeenCalledWith('Create failed')
        expect(mocks.toastError).toHaveBeenCalledWith('Unable to create usage rule.')
        expect(mocks.toastError).toHaveBeenCalledWith('Update failed')
        expect(mocks.toastError).toHaveBeenCalledWith('Unable to update usage rule.')
        expect(mocks.toastError).toHaveBeenCalledWith('Unable to delete usage rule.')
    })

    it('runs mutation success callbacks directly', async () => {
        renderHook(() => useInventoryActions())

        await act(async () => {
            await mocks.mutationOptionsByName.get('createItem').onSuccess()
            await mocks.mutationOptionsByName.get('updateItem').onSuccess()
            await mocks.mutationOptionsByName.get('adjustStock').onSuccess()
            await mocks.mutationOptionsByName.get('deleteItem').onSuccess()
            await mocks.mutationOptionsByName.get('setStocked').onSuccess(undefined, { stocked: true })
            await mocks.mutationOptionsByName.get('setStocked').onSuccess(undefined, { stocked: false })
            await mocks.mutationOptionsByName.get('createUsageRule').onSuccess()
            await mocks.mutationOptionsByName.get('updateUsageRule').onSuccess()
            await mocks.mutationOptionsByName.get('deleteUsageRule').onSuccess()
        })

        expect(mocks.toastSuccess).toHaveBeenCalledWith('Item is now tracked here.')
        expect(mocks.toastSuccess).toHaveBeenCalledWith('Item marked unused here.')
    })
})
