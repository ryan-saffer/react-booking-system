// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { InventoryItemsTable } from './inventory-items-table'

import type { ClientInventoryItem, ClientInventoryStockLevel } from '../../utils/inventory.types'
import type { ReactNode } from 'react'

vi.mock('@ui-components/dropdown-menu', () => {
    return {
        DropdownMenu: ({ children }: { children: ReactNode }) => <div>{children}</div>,
        DropdownMenuContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
        DropdownMenuItem: ({ children, disabled, onClick }: any) => (
            <button type="button" disabled={disabled} onClick={onClick}>
                {children}
            </button>
        ),
        DropdownMenuTrigger: ({ children }: { children: ReactNode }) => <>{children}</>,
    }
})

vi.mock('@utils/studioUtils', () => ({
    getOrgName: (studio: string) => `${studio} studio`,
}))

const baseItem: ClientInventoryItem = {
    id: 'item-1',
    name: 'Party pies',
    category: 'party-food',
    status: 'active',
    $trackingMode: 'quantity',
    baseUnit: 'each',
    runningLowThreshold: 10,
    notes: 'Frozen',
    createdAt: new Date(),
    updatedAt: new Date(),
}

const stock = (overrides: Partial<ClientInventoryStockLevel> = {}): ClientInventoryStockLevel => ({
    id: 'stock-1',
    itemId: 'item-1',
    location: 'balwyn',
    stocked: true,
    measurement: { $type: 'quantity', quantity: 4 },
    updatedAt: new Date(),
    ...overrides,
})

afterEach(() => {
    cleanup()
})

function renderTable(overrides: Partial<Parameters<typeof InventoryItemsTable>[0]> = {}) {
    const props = {
        title: 'Tracked',
        description: 'Stock here',
        emptyTitle: 'Empty',
        emptyDescription: 'Nothing here',
        isLoading: false,
        items: [baseItem],
        location: 'balwyn' as const,
        canEdit: true,
        isAdjustStockPending: false,
        isSetStockedPending: false,
        onEditItem: vi.fn(),
        onMarkQuantityUnknown: vi.fn(),
        onOpenStockAction: vi.fn(),
        onSetStocked: vi.fn(),
        stockByItemId: new Map([['item-1', stock()]]),
        ...overrides,
    }
    const view = render(<InventoryItemsTable {...props} />)
    view.rerender(<InventoryItemsTable {...props} />)
    return view
}

describe('InventoryItemsTable', () => {
    it('renders loading and empty states', () => {
        const { rerender } = renderTable({ isLoading: true, items: [] })
        expect(screen.getByText('Loading inventory')).toBeTruthy()

        const emptyProps = {
            title: 'Tracked',
            description: 'Stock here',
            emptyTitle: 'Empty',
            emptyDescription: 'Nothing here',
            isLoading: false,
            items: [],
            location: 'balwyn' as const,
            canEdit: false,
            isAdjustStockPending: false,
            isSetStockedPending: false,
            onEditItem: vi.fn(),
            onMarkQuantityUnknown: vi.fn(),
            onOpenStockAction: vi.fn(),
            onSetStocked: vi.fn(),
            stockByItemId: new Map(),
        }
        rerender(<InventoryItemsTable {...emptyProps} />)
        rerender(<InventoryItemsTable {...emptyProps} />)
        expect(screen.getByText('Empty')).toBeTruthy()
        expect(screen.getByText('Nothing here')).toBeTruthy()
    })

    it('renders stock states and triggers primary actions', async () => {
        const onOpenStockAction = vi.fn()
        const user = userEvent.setup()

        renderTable({ onOpenStockAction })

        expect(screen.getByText('Running low')).toBeTruthy()
        expect(screen.getByText('4 units')).toBeTruthy()
        expect(screen.getByText('Frozen')).toBeTruthy()

        await user.click(screen.getByRole('button', { name: 'Receive' }))
        await user.click(screen.getByRole('button', { name: 'Set stock' }))

        expect(onOpenStockAction).toHaveBeenCalledWith('receive', baseItem, expect.any(Object))
        expect(onOpenStockAction).toHaveBeenCalledWith('set', baseItem, expect.any(Object))
    })

    it('renders archived, unused, unknown, qualitative, and missing stock states', () => {
        const archived = { ...baseItem, id: 'archived', name: 'Archived', status: 'archived' as const }
        const unused = { ...baseItem, id: 'unused', name: 'Unused' }
        const unknown = { ...baseItem, id: 'unknown', name: 'Unknown' }
        const qualitative: ClientInventoryItem = {
            id: 'qualitative',
            name: 'Glitter',
            category: 'glitter',
            status: 'active',
            $trackingMode: 'qualitative',
            baseUnit: 'tub',
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        const low = { ...qualitative, id: 'low', name: 'Low glitter' }
        const out = { ...qualitative, id: 'out', name: 'Out glitter' }
        const unknownLevel = { ...qualitative, id: 'unknown-level', name: 'Unknown glitter' }
        const missing = { ...baseItem, id: 'missing', name: 'Missing' }

        renderTable({
            items: [archived, unused, unknown, qualitative, low, out, unknownLevel, missing],
            stockByItemId: new Map([
                ['archived', stock({ itemId: 'archived' })],
                ['unused', stock({ itemId: 'unused', stocked: false })],
                ['unknown', stock({ itemId: 'unknown', measurement: { $type: 'quantity', quantity: null } })],
                [
                    'qualitative',
                    stock({ itemId: 'qualitative', measurement: { $type: 'qualitative', level: 'medium' } }),
                ],
                ['low', stock({ itemId: 'low', measurement: { $type: 'qualitative', level: 'low' } })],
                ['out', stock({ itemId: 'out', measurement: { $type: 'qualitative', level: 'out' } })],
                [
                    'unknown-level',
                    stock({ itemId: 'unknown-level', measurement: { $type: 'qualitative', level: 'unknown' } }),
                ],
            ]),
        })

        expect(screen.getAllByText('Archived').length).toBeGreaterThan(0)
        expect(screen.getAllByText('Unused here').length).toBeGreaterThan(0)
        expect(screen.getAllByText('Unknown').length).toBeGreaterThan(0)
        expect(screen.getByText('Medium')).toBeTruthy()
        expect(screen.getByText('Low')).toBeTruthy()
        expect(screen.getByText('Out')).toBeTruthy()
        expect(screen.getAllByText('Unknown').length).toBeGreaterThan(0)
        expect(screen.getByText('No studio record')).toBeTruthy()
    })

    it('renders edit, unused, count, qualitative, and track-here actions', async () => {
        const onEditItem = vi.fn()
        const onMarkQuantityUnknown = vi.fn()
        const onOpenStockAction = vi.fn()
        const onSetStocked = vi.fn()
        const user = userEvent.setup()
        const unused = { ...baseItem, id: 'unused', name: 'Unused' }
        const qualitative: ClientInventoryItem = {
            id: 'qualitative',
            name: 'Glitter',
            category: 'glitter',
            status: 'active',
            $trackingMode: 'qualitative',
            baseUnit: 'tub',
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        renderTable({
            items: [baseItem, unused, qualitative],
            onEditItem,
            onMarkQuantityUnknown,
            onOpenStockAction,
            onSetStocked,
            stockByItemId: new Map([
                ['item-1', stock()],
                ['unused', stock({ itemId: 'unused', stocked: false })],
                ['qualitative', stock({ itemId: 'qualitative', measurement: { $type: 'qualitative', level: 'high' } })],
            ]),
        })

        await user.click(screen.getAllByRole('button', { name: 'Update level' })[0])
        await user.click(screen.getByRole('button', { name: 'Track here' }))
        await user.click(screen.getAllByRole('button', { name: /Edit item/ })[0])
        await user.click(screen.getAllByRole('button', { name: /Mark unused here/ })[0])
        await user.click(screen.getAllByRole('button', { name: /Mark count unknown/ })[0])

        expect(onOpenStockAction).toHaveBeenCalledWith('level', qualitative, expect.any(Object))
        expect(onSetStocked).toHaveBeenCalledWith(unused, true)
        expect(onEditItem).toHaveBeenCalledWith(baseItem)
        expect(onSetStocked).toHaveBeenCalledWith(baseItem, false)
        expect(onMarkQuantityUnknown).toHaveBeenCalledWith(baseItem)
    })

    it('omits action controls when editing is not allowed', () => {
        renderTable({ canEdit: false })

        expect(screen.queryAllByRole('button', { name: 'Receive' })).toEqual([])
    })
})
