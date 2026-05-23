// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { InventoryDialogs } from './inventory-dialogs'
import { useInventoryStore } from '../../state/inventory-store'

import type {
    ClientInventoryItem,
    ClientInventoryStockLevel,
    ClientInventoryUsageRule,
} from '../../utils/inventory.types'
import type { ReactNode } from 'react'

vi.mock('@ui-components/dialog', () => {
    return {
        Dialog: ({ children, onOpenChange, open }: any) => (
            <div data-open={String(open)}>
                {children}
                <button type="button" onClick={() => onOpenChange?.(false)}>
                    Close dialog
                </button>
                <button type="button" onClick={() => onOpenChange?.(true)}>
                    Keep dialog open
                </button>
            </div>
        ),
        DialogContent: ({ children }: { children: ReactNode }) => <div role="dialog">{children}</div>,
        DialogDescription: ({ children }: { children: ReactNode }) => <p>{children}</p>,
        DialogHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
        DialogTitle: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
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

vi.mock('@utils/studioUtils', () => ({
    getOrgName: (studio: string) => `${studio} studio`,
}))

vi.mock('../../hooks/use-inventory-location', () => ({
    useInventoryLocation: () => ({ location: 'balwyn' }),
}))

vi.mock('../../hooks/use-inventory-actions', () => ({
    useInventoryActions: () => ({
        adjustStock: vi.fn(),
        deleteItem: vi.fn(),
        deleteUsageRule: vi.fn(),
        isAdjustStockPending: false,
        isDeletingItem: false,
        isDeletingUsageRule: false,
        isUpdatingItem: false,
        isUpdatingUsageRule: false,
        updateItem: vi.fn(),
        updateUsageRule: vi.fn(),
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
    status: 'active',
    quantity: { $operation: 'fixed', quantity: 2 },
    createdAt: now,
    updatedAt: now,
}

describe('InventoryDialogs', () => {
    beforeEach(() => {
        useInventoryStore.setState({ editingItem: null, editingUsageRule: null, stockAction: null })
    })

    afterEach(() => {
        cleanup()
    })

    it('renders edit and stock action dialogs from store state and closes them', async () => {
        const user = userEvent.setup()
        useInventoryStore.setState({
            editingItem: item,
            editingUsageRule: usageRule,
            stockAction: { $type: 'set', item, stock },
        })

        const { rerender } = render(<InventoryDialogs />)
        rerender(<InventoryDialogs />)

        expect(screen.getByText('Edit inventory item')).toBeTruthy()
        expect(screen.getByText('Edit usage rule')).toBeTruthy()
        expect(screen.getByText('Set stock for Party pies')).toBeTruthy()
        expect(
            screen.getByText('Enter the actual count at balwyn studio. This is the fastest stocktake correction.')
        ).toBeTruthy()

        await user.click(screen.getAllByRole('button', { name: 'Keep dialog open' })[0])
        expect(useInventoryStore.getState().editingItem?.id).toBe('item-1')

        const closeButtons = screen.getAllByRole('button', { name: 'Close dialog' })
        await user.click(closeButtons[0])
        await user.click(closeButtons[1])
        await user.click(closeButtons[2])

        expect(useInventoryStore.getState().editingItem).toBeNull()
        expect(useInventoryStore.getState().editingUsageRule).toBeNull()
        expect(useInventoryStore.getState().stockAction).toBeNull()
    })

    it('renders empty stock dialog content safely when no action is selected', () => {
        const { rerender } = render(<InventoryDialogs />)
        rerender(<InventoryDialogs />)

        expect(screen.queryByText('Receive Party pies')).toBeNull()
    })
})
