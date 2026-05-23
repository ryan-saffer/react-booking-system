// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { InventoryItemForm } from './inventory-item-form'
import { StockActionForm } from './stock-action-form'

import type { InventoryItemFormInput } from '../../utils/inventory.form-schemas'
import type { ClientInventoryItem, ClientInventoryStockLevel, StockAction } from '../../utils/inventory.types'

vi.mock('@ui-components/select', async () => {
    const React = await import('react')

    function SelectItem({ value, children }: { value: string; children: React.ReactNode }) {
        return <option value={value}>{children}</option>
    }

    function collectOptions(children: React.ReactNode): React.ReactNode[] {
        return React.Children.toArray(children).flatMap((child) => {
            if (!React.isValidElement<{ children?: React.ReactNode }>(child)) return []
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
        SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
        SelectItem,
        SelectTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
        SelectValue: () => null,
    }
})

const now = new Date('2026-05-01T00:00:00.000Z')

const quantityItem: ClientInventoryItem = {
    id: 'item-1',
    name: 'Party pies',
    inventoryKey: 'party-base:partyPies',
    category: 'party-food',
    status: 'active',
    $trackingMode: 'quantity',
    baseUnit: 'each',
    runningLowThreshold: 10,
    notes: 'Frozen',
    createdAt: now,
    updatedAt: now,
}

const qualitativeItem: ClientInventoryItem = {
    id: 'item-2',
    name: 'Glitter',
    category: 'glitter',
    status: 'active',
    $trackingMode: 'qualitative',
    baseUnit: 'tub',
    createdAt: now,
    updatedAt: now,
}

const quantityStock: ClientInventoryStockLevel = {
    id: 'stock-1',
    itemId: 'item-1',
    location: 'balwyn',
    stocked: true,
    measurement: { $type: 'quantity', quantity: 4 },
    updatedAt: now,
}

const unknownQuantityStock: ClientInventoryStockLevel = {
    ...quantityStock,
    measurement: { $type: 'quantity', quantity: null },
}

const qualitativeStock: ClientInventoryStockLevel = {
    id: 'stock-2',
    itemId: 'item-2',
    location: 'balwyn',
    stocked: true,
    measurement: { $type: 'qualitative', level: 'medium' },
    updatedAt: now,
}

afterEach(() => {
    cleanup()
})

describe('InventoryItemForm', () => {
    it('normalizes submitted quantity and qualitative item values', async () => {
        const onSubmit = vi.fn()
        const user = userEvent.setup()

        const { rerender } = render(
            <InventoryItemForm isPending={false} submitLabel="Create item" onSubmit={onSubmit} />
        )
        rerender(<InventoryItemForm isPending={false} submitLabel="Create item" onSubmit={onSubmit} />)

        await user.type(screen.getByLabelText('Item name'), 'Party pies')
        await user.type(screen.getByLabelText('Shopping-list name'), 'partyPies')
        await user.type(screen.getByLabelText('Running low threshold'), '5')

        const [keyType, category, tracking, baseUnit, status] = screen.getAllByRole('combobox')
        await user.selectOptions(keyType, 'party-base')
        await user.selectOptions(category, 'paint')
        await user.selectOptions(baseUnit, 'box')
        await user.selectOptions(status, 'archived')

        await user.click(screen.getByRole('button', { name: 'Create item' }))

        await waitFor(() => {
            expect(onSubmit).toHaveBeenLastCalledWith({
                $trackingMode: 'quantity',
                name: 'Party pies',
                inventoryKeyType: 'party-base',
                inventoryKeyName: 'partyPies',
                inventoryKey: 'party-base:partyPies',
                category: 'paint',
                baseUnit: 'box',
                runningLowThreshold: 5,
                status: 'archived',
                notes: '',
            })
        })

        await user.selectOptions(tracking, 'qualitative')
        expect(screen.queryByLabelText('Running low threshold')).toBeNull()
        await user.click(screen.getByRole('button', { name: 'Create item' }))

        await waitFor(() => {
            expect(onSubmit).toHaveBeenLastCalledWith(
                expect.objectContaining({ $trackingMode: 'qualitative', runningLowThreshold: null })
            )
        })
    })

    it('resets from default values and supports delete and pending states', async () => {
        const onDelete = vi.fn()
        const user = userEvent.setup()
        const defaultValues: InventoryItemFormInput = {
            name: 'Glitter',
            inventoryKeyType: 'party-addition',
            inventoryKeyName: 'glitter',
            category: 'glitter',
            $trackingMode: 'qualitative',
            baseUnit: 'tub',
            runningLowThreshold: '',
            status: 'active',
            notes: 'Use sparingly',
        }

        const { rerender } = render(
            <InventoryItemForm
                defaultValues={defaultValues}
                isPending={false}
                item={qualitativeItem}
                submitLabel="Save changes"
                onDelete={onDelete}
                onSubmit={vi.fn()}
            />
        )

        expect((screen.getByLabelText('Item name') as HTMLInputElement).value).toBe('Glitter')
        expect(screen.getByDisplayValue('Use sparingly')).toBeTruthy()

        await user.click(screen.getByRole('button', { name: /Delete item/ }))
        expect(onDelete).toHaveBeenCalledOnce()

        rerender(
            <InventoryItemForm
                defaultValues={defaultValues}
                isPending
                item={qualitativeItem}
                submitLabel="Save changes"
                onDelete={onDelete}
                onSubmit={vi.fn()}
            />
        )
        expect((screen.getByRole('button', { name: /Save changes/ }) as HTMLButtonElement).disabled).toBe(true)
    })
})

describe('StockActionForm', () => {
    it('submits received stock quantities', async () => {
        const onSubmit = vi.fn()
        const user = userEvent.setup()
        const action: StockAction = { $type: 'receive', item: quantityItem, stock: quantityStock }

        const { rerender } = render(<StockActionForm action={action} isPending={false} onSubmit={onSubmit} />)
        rerender(<StockActionForm action={action} isPending={false} onSubmit={onSubmit} />)

        await user.type(screen.getByLabelText('Quantity received'), '3')
        await user.type(screen.getByLabelText('Notes'), 'Delivery')
        await user.click(screen.getByRole('button', { name: 'Receive stock' }))

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith({ quantity: 3, level: 'unknown', reason: 'Delivery' })
        })
    })

    it('renders set-stock guidance for known and unknown counts', async () => {
        const onSubmit = vi.fn()
        const user = userEvent.setup()
        const unknownAction: StockAction = { $type: 'set', item: quantityItem, stock: unknownQuantityStock }
        const knownAction: StockAction = { $type: 'set', item: quantityItem, stock: quantityStock }

        const { rerender } = render(<StockActionForm action={unknownAction} isPending={false} onSubmit={onSubmit} />)

        expect(screen.getByText('Current recorded stock is unknown. Saving will set the counted amount.')).toBeTruthy()
        await user.type(screen.getByLabelText('Actual stock count'), '7')
        await user.click(screen.getByRole('button', { name: 'Set stock count' }))

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith({ quantity: 7, level: 'unknown', reason: '' })
        })

        rerender(<StockActionForm action={knownAction} isPending onSubmit={onSubmit} />)
        expect(screen.getByText('Current recorded stock is 4. Saving will set the counted amount.')).toBeTruthy()
        expect((screen.getByRole('button', { name: /Set stock count/ }) as HTMLButtonElement).disabled).toBe(true)
    })

    it('submits qualitative stock levels', async () => {
        const onSubmit = vi.fn()
        const user = userEvent.setup()
        const action: StockAction = { $type: 'level', item: qualitativeItem, stock: qualitativeStock }

        const { rerender } = render(<StockActionForm action={action} isPending={false} onSubmit={onSubmit} />)
        rerender(<StockActionForm action={action} isPending={false} onSubmit={onSubmit} />)

        await user.selectOptions(screen.getByRole('combobox'), 'high')
        await user.click(screen.getByRole('button', { name: 'Update level' }))

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith({ quantity: 0, level: 'high', reason: '' })
        })
    })
})
