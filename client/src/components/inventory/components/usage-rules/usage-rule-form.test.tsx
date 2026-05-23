// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { UsageRuleForm } from './usage-rule-form'

import type { UsageRuleFormInput } from '../../utils/inventory.form-schemas'
import type { ClientInventoryUsageRule } from '../../utils/inventory.types'

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

const usageRule: ClientInventoryUsageRule = {
    id: 'rule-1',
    $type: 'party-base',
    inventoryKey: 'party-base:partyPies',
    label: 'Party pies',
    status: 'active',
    quantity: { $operation: 'fixed', quantity: 2 },
    notes: 'Frozen',
    createdAt: now,
    updatedAt: now,
}

afterEach(() => {
    cleanup()
})

describe('UsageRuleForm', () => {
    it('updates generated keys and quantity fields as rule options change', async () => {
        const onSubmit = vi.fn()
        const user = userEvent.setup()

        const { rerender } = render(<UsageRuleForm isPending={false} submitLabel="Create rule" onSubmit={onSubmit} />)
        rerender(<UsageRuleForm isPending={false} submitLabel="Create rule" onSubmit={onSubmit} />)

        expect(screen.getByText('party-addition:chickenNuggets')).toBeTruthy()

        let [ruleType] = screen.getAllByRole('combobox')
        await user.selectOptions(ruleType, 'party-base')
        expect(screen.queryByText('party-addition:chickenNuggets')).toBeNull()

        await user.type(screen.getByLabelText('Name'), 'partyPies')
        expect(screen.getByText('party-base:partyPies')).toBeTruthy()

        let [, quantityOperation] = screen.getAllByRole('combobox')
        await user.selectOptions(quantityOperation, 'per-child')
        expect(screen.getByLabelText('Amount per child')).toBeTruthy()
        ;[, quantityOperation] = screen.getAllByRole('combobox')
        await user.selectOptions(quantityOperation, 'fixed-plus-per-child')
        expect(screen.getByLabelText('Fixed amount per booking')).toBeTruthy()
        ;[, quantityOperation] = screen.getAllByRole('combobox')
        await user.selectOptions(quantityOperation, 'fixed')
        await user.clear(screen.getByLabelText('Amount per booking'))
        await user.type(screen.getByLabelText('Amount per booking'), '2')
        await user.type(screen.getByLabelText('Display label'), 'Party pies')
        await user.type(screen.getByLabelText('Notes'), 'Frozen')

        const [, , status] = screen.getAllByRole('combobox')
        await user.selectOptions(status, 'archived')
        await user.click(screen.getByRole('button', { name: 'Create rule' }))

        await waitFor(() => {
            expect(onSubmit).toHaveBeenLastCalledWith({
                $type: 'party-base',
                name: 'partyPies',
                label: 'Party pies',
                status: 'archived',
                quantity: { $operation: 'fixed', quantity: 2 },
                notes: 'Frozen',
            })
        })
        ;[ruleType] = screen.getAllByRole('combobox')
        await user.selectOptions(ruleType, 'party-addition')
        expect(screen.getByText('party-addition:chickenNuggets')).toBeTruthy()
    })

    it('renders default values, delete action, and pending state', async () => {
        const onDelete = vi.fn()
        const user = userEvent.setup()
        const defaultValues: UsageRuleFormInput = {
            $type: 'party-base',
            name: 'partyPies',
            label: 'Party pies',
            status: 'active',
            quantity: { $operation: 'fixed-plus-per-child', fixedQuantity: '1', quantityPerChild: '0.5' },
            notes: 'Frozen',
        }

        const { rerender } = render(
            <UsageRuleForm
                defaultValues={defaultValues}
                isPending={false}
                submitLabel="Save rule"
                usageRule={usageRule}
                onDelete={onDelete}
                onSubmit={vi.fn()}
            />
        )

        expect(screen.getByDisplayValue('partyPies')).toBeTruthy()
        expect(screen.getByDisplayValue('0.5')).toBeTruthy()

        await user.click(screen.getByRole('button', { name: /Delete rule/ }))
        expect(onDelete).toHaveBeenCalledOnce()

        rerender(
            <UsageRuleForm
                defaultValues={defaultValues}
                isPending
                submitLabel="Save rule"
                usageRule={usageRule}
                onDelete={onDelete}
                onSubmit={vi.fn()}
            />
        )
        expect((screen.getByRole('button', { name: /Save rule/ }) as HTMLButtonElement).disabled).toBe(true)
    })

    it('submits per-child quantity rules', async () => {
        const onSubmit = vi.fn()
        const user = userEvent.setup()

        render(
            <UsageRuleForm
                defaultValues={{
                    $type: 'party-base',
                    name: 'plates',
                    label: '',
                    status: 'active',
                    quantity: { $operation: 'per-child', quantityPerChild: '3' },
                    notes: '',
                }}
                isPending={false}
                submitLabel="Create rule"
                onSubmit={onSubmit}
            />
        )

        await user.click(screen.getByRole('button', { name: 'Create rule' }))

        await waitFor(() => {
            expect(onSubmit).toHaveBeenCalledWith({
                $type: 'party-base',
                name: 'plates',
                label: undefined,
                status: 'active',
                quantity: { $operation: 'per-child', quantityPerChild: 3 },
                notes: undefined,
            })
        })
    })
})
