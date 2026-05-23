// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { InventoryCatalogueCard } from './inventory-catalogue-card'
import { useInventoryStore } from '../../state/inventory-store'

import type { ClientInventoryItem, ClientInventoryStockLevel } from '../../utils/inventory.types'
import type { ReactNode } from 'react'

vi.mock('@components/Session/use-org', () => ({
    useOrg: () => ({ hasPermission: (permission: string) => permission === 'inventory:write' && canEdit }),
}))

vi.mock('@utils/studioUtils', () => ({
    getOrgName: (studio: string) => `${studio} studio`,
}))

vi.mock('@ui-components/dialog', () => {
    return {
        Dialog: ({ children }: { children: ReactNode }) => <>{children}</>,
        DialogContent: ({ children }: { children: ReactNode }) => <div role="dialog">{children}</div>,
        DialogDescription: ({ children }: { children: ReactNode }) => <p>{children}</p>,
        DialogHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
        DialogTitle: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
        DialogTrigger: ({ children }: { children: ReactNode }) => <>{children}</>,
    }
})

vi.mock('@ui-components/select', async () => {
    const { Children, isValidElement } = await import('react')

    function SelectItem({ value, children }: { value: string; children: ReactNode }) {
        return <option value={value}>{children}</option>
    }

    function collectOptions(children: ReactNode): ReactNode[] {
        return Children.toArray(children).flatMap((child) => {
            if (!isValidElement<{ children?: ReactNode }>(child)) return []
            if (child.type === SelectItem) return [child]
            return collectOptions(child.props.children)
        })
    }

    return {
        Select: ({ children, disabled, onValueChange, value }: any) => (
            <select disabled={disabled} value={value} onChange={(event) => onValueChange?.(event.target.value)}>
                {collectOptions(children)}
            </select>
        ),
        SelectContent: ({ children }: { children: ReactNode }) => <>{children}</>,
        SelectItem,
        SelectTrigger: ({ children }: { children: ReactNode }) => <>{children}</>,
        SelectValue: () => null,
    }
})

let canEdit = true
let canChooseLocation = true
let catalogueHiddenItems: ClientInventoryItem[] = []
let catalogueLocation: 'balwyn' | undefined = 'balwyn'

const now = new Date('2026-05-01T00:00:00.000Z')

const trackedItem: ClientInventoryItem = {
    id: 'item-1',
    name: 'Party pies',
    inventoryKey: 'party-base:partyPies',
    category: 'party-food',
    status: 'active',
    $trackingMode: 'quantity',
    baseUnit: 'each',
    runningLowThreshold: 10,
    createdAt: now,
    updatedAt: now,
}

const hiddenItem: ClientInventoryItem = {
    ...trackedItem,
    id: 'item-2',
    name: 'Archived glitter',
    category: 'glitter',
    status: 'archived',
}

const trackedStock: ClientInventoryStockLevel = {
    id: 'stock-1',
    itemId: 'item-1',
    location: 'balwyn',
    stocked: true,
    measurement: { $type: 'quantity', quantity: 4 },
    updatedAt: now,
}

vi.mock('../../hooks/use-inventory-data', () => ({
    useInventoryData: () => ({
        activeTrackedCount: 1,
        availableLocations: ['balwyn', 'kingsville'],
        canChooseLocation,
        hiddenItems: catalogueHiddenItems,
        isLoading: false,
        itemCount: 2,
        location: catalogueLocation,
        needsCountItemCount: 0,
        notRunningLowItemCount: 0,
        runningLowItemCount: 1,
        shownItemCount: 2,
        stockByItemId: new Map([['item-1', trackedStock]]),
        trackedItems: [trackedItem],
        trackedStockCount: 1,
    }),
}))

vi.mock('../../hooks/use-inventory-actions', () => ({
    useInventoryActions: () => ({
        createItem: vi.fn(),
        isAdjustStockPending: false,
        isCreatingItem: false,
        isSetStockedPending: false,
        markQuantityUnknown: vi.fn(),
        setItemStocked: vi.fn(),
    }),
}))

describe('InventoryCatalogueCard', () => {
    beforeEach(() => {
        canEdit = true
        canChooseLocation = true
        catalogueHiddenItems = [hiddenItem]
        catalogueLocation = 'balwyn'
        useInventoryStore.setState({
            categoryFilter: 'all',
            isCreateDialogOpen: false,
            search: '',
            selectedLocation: undefined,
            showHiddenItems: false,
            stockStatusFilter: 'all',
        })
    })

    afterEach(() => {
        cleanup()
    })

    it('renders catalogue controls and toggles hidden items', async () => {
        const user = userEvent.setup()

        const { rerender } = render(<InventoryCatalogueCard />)
        rerender(<InventoryCatalogueCard />)

        expect(screen.getByText('Inventory catalogue')).toBeTruthy()
        expect(screen.getByText('2 shown')).toBeTruthy()
        expect(screen.getByRole('button', { name: /Create new item/ })).toBeTruthy()

        await user.type(screen.getByPlaceholderText('Search items'), 'pies')
        expect(useInventoryStore.getState().search).toBe('pies')
        await user.click(screen.getByRole('button', { name: 'Clear inventory search' }))
        expect(useInventoryStore.getState().search).toBe('')

        const comboboxes = screen.getAllByRole('combobox')
        await user.selectOptions(comboboxes[5], 'paint')
        await user.selectOptions(comboboxes[6], 'kingsville')
        expect(useInventoryStore.getState().categoryFilter).toBe('paint')
        expect(useInventoryStore.getState().selectedLocation).toBe('kingsville')

        await user.click(screen.getByRole('button', { name: /Running low/ }))
        expect(useInventoryStore.getState().stockStatusFilter).toBe('running-low')

        await user.click(screen.getByRole('button', { name: /Show 1 hidden item/ }))
        expect(screen.getByText('Hidden items')).toBeTruthy()
        expect(screen.getByText('Archived glitter')).toBeTruthy()
    })

    it('hides create and action controls without write permission', () => {
        canEdit = false
        canChooseLocation = false
        catalogueHiddenItems = []
        catalogueLocation = undefined

        const { rerender } = render(<InventoryCatalogueCard />)
        rerender(<InventoryCatalogueCard />)

        expect(screen.queryByRole('button', { name: /Create new item/ })).toBeNull()
        expect(screen.queryByRole('button', { name: 'Receive' })).toBeNull()
        expect(screen.getByText('Viewing stock for selected studio.')).toBeTruthy()
        expect(screen.queryByRole('button', { name: /Show .* hidden/ })).toBeNull()
    })
})
