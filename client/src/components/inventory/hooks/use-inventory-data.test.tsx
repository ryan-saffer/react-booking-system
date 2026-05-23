// @vitest-environment jsdom

import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useInventoryData } from './use-inventory-data'
import { useInventoryStore } from '../state/inventory-store'

import type { ClientInventoryItem, ClientInventoryStockLevel } from '../utils/inventory.types'

type QuantityClientInventoryItem = Extract<ClientInventoryItem, { $trackingMode: 'quantity' }>

const listItemsQueryOptions = vi.fn((input: unknown) => ({ input, query: 'items' }))
const listStockQueryOptions = vi.fn((input: unknown) => ({ input, query: 'stock' }))
let itemsData: ClientInventoryItem[] = []
let stockData: ClientInventoryStockLevel[] = []
let itemsPending = false
let stockPending = false

vi.mock('@tanstack/react-query', () => ({
    useQuery: (options: { query: 'items' | 'stock' }) =>
        options.query === 'items'
            ? { data: itemsData, isPending: itemsPending }
            : { data: stockData, isPending: stockPending },
}))

vi.mock('@utils/trpc', () => ({
    useTRPC: () => ({
        inventory: {
            listItems: { queryOptions: listItemsQueryOptions },
            listStock: { queryOptions: listStockQueryOptions },
        },
    }),
}))

vi.mock('./use-inventory-location', () => ({
    useInventoryLocation: () => ({
        availableLocations: ['balwyn', 'kingsville'],
        canChooseLocation: true,
        location: 'balwyn',
    }),
}))

const now = new Date('2026-05-01T00:00:00.000Z')

function quantityItem(overrides: Partial<QuantityClientInventoryItem>): QuantityClientInventoryItem {
    return {
        id: 'item-1',
        name: 'Party pies',
        category: 'party-food',
        status: 'active',
        $trackingMode: 'quantity',
        baseUnit: 'each',
        runningLowThreshold: 10,
        createdAt: now,
        updatedAt: now,
        ...overrides,
    }
}

function stock(overrides: Partial<ClientInventoryStockLevel>): ClientInventoryStockLevel {
    return {
        id: 'stock-1',
        itemId: 'item-1',
        location: 'balwyn',
        stocked: true,
        measurement: { $type: 'quantity', quantity: 4 },
        updatedAt: now,
        ...overrides,
    }
}

describe('useInventoryData', () => {
    beforeEach(() => {
        listItemsQueryOptions.mockClear()
        listStockQueryOptions.mockClear()
        itemsPending = false
        stockPending = false
        useInventoryStore.setState({ categoryFilter: 'all', search: '', stockStatusFilter: 'all' })
    })

    it('derives sorted tracked and hidden inventory data', () => {
        itemsData = [
            quantityItem({ id: 'party', name: 'Party pies' }),
            quantityItem({ id: 'archived', name: 'Archived glitter', status: 'archived' }),
            {
                id: 'paint',
                name: 'Paint pots',
                category: 'paint',
                status: 'active',
                $trackingMode: 'qualitative',
                baseUnit: 'tub',
                createdAt: now,
                updatedAt: now,
            },
        ]
        stockData = [
            stock({ itemId: 'party', measurement: { $type: 'quantity', quantity: 4 } }),
            stock({ itemId: 'archived', stocked: false }),
            stock({ itemId: 'paint', measurement: { $type: 'qualitative', level: 'low' } }),
        ]

        const { rerender, result } = renderHook(() => useInventoryData())
        rerender()

        expect(listItemsQueryOptions).toHaveBeenCalledWith({ includeArchived: true, category: undefined })
        expect(listStockQueryOptions).toHaveBeenCalledWith({ location: 'balwyn' })
        expect(result.current.activeTrackedCount).toBe(2)
        expect(result.current.runningLowItemCount).toBe(2)
        expect(result.current.notRunningLowItemCount).toBe(0)
        expect(result.current.trackedItems.map((item) => item.name)).toEqual(['Paint pots', 'Party pies'])
        expect(result.current.hiddenItems.map((item) => item.name)).toEqual(['Archived glitter'])
        expect(result.current.trackedStockCount).toBe(2)
    })

    it('applies category, search, and stock-status filters', () => {
        useInventoryStore.setState({ categoryFilter: 'party-food', search: 'plates', stockStatusFilter: 'needs-count' })
        itemsPending = true
        stockPending = false
        itemsData = [
            quantityItem({ id: 'plates', name: 'Paper plates' }),
            quantityItem({ id: 'pies', name: 'Party pies' }),
        ]
        stockData = [
            stock({ itemId: 'plates', measurement: { $type: 'quantity', quantity: null } }),
            stock({ itemId: 'pies', measurement: { $type: 'quantity', quantity: 20 } }),
        ]

        const { rerender, result } = renderHook(() => useInventoryData())
        rerender()

        expect(listItemsQueryOptions).toHaveBeenCalledWith({ includeArchived: true, category: 'party-food' })
        expect(result.current.isLoading).toBe(true)
        expect(result.current.shownItemCount).toBe(1)
        expect(result.current.needsCountItemCount).toBe(1)
        expect(result.current.trackedItems[0].name).toBe('Paper plates')
    })

    it('falls back safely when queries have not returned data yet', () => {
        itemsData = undefined as any
        stockData = undefined as any

        const { result } = renderHook(() => useInventoryData())

        expect(result.current.itemCount).toBe(0)
        expect(result.current.trackedStockCount).toBe(0)
        expect(result.current.stockByItemId.size).toBe(0)
    })
})
