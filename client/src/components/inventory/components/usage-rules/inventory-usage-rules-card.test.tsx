// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { InventoryUsageRulesCard } from './inventory-usage-rules-card'
import { useInventoryStore } from '../../state/inventory-store'

import type { ClientInventoryUsageRule } from '../../utils/inventory.types'
import type { ReactNode } from 'react'

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

vi.mock('./usage-rule-form', () => ({
    UsageRuleForm: ({ submitLabel }: { submitLabel: string }) => <div>{submitLabel} form</div>,
}))

const usageRulesState: { canEdit: boolean; isLoading: boolean; usageRules: ClientInventoryUsageRule[] } = {
    canEdit: true,
    isLoading: false,
    usageRules: [],
}

vi.mock('../../hooks/use-inventory-usage-rules', () => ({
    useInventoryUsageRules: () => usageRulesState,
}))

vi.mock('../../hooks/use-inventory-actions', () => ({
    useInventoryActions: () => ({ isCreatingUsageRule: false, createUsageRule: vi.fn() }),
}))

const now = new Date('2026-05-01T00:00:00.000Z')

const rules: ClientInventoryUsageRule[] = [
    {
        id: 'rule-1',
        $type: 'party-addition',
        addition: 'chickenNuggets',
        inventoryKey: 'party-addition:chickenNuggets',
        status: 'active',
        quantity: { $operation: 'fixed', quantity: 2 },
        createdAt: now,
        updatedAt: now,
    },
    {
        id: 'rule-2',
        $type: 'party-base',
        inventoryKey: 'party-base:partyPies',
        label: 'Party pies',
        status: 'archived',
        quantity: { $operation: 'per-child', quantityPerChild: 1 },
        createdAt: now,
        updatedAt: now,
    },
    {
        id: 'rule-3',
        $type: 'party-food-package',
        inventoryKey: 'party-food-package:fairyBread',
        status: 'active',
        quantity: { $operation: 'fixed-plus-per-child', fixedQuantity: 1, quantityPerChild: 0.5 },
        createdAt: now,
        updatedAt: now,
    },
]

describe('InventoryUsageRulesCard', () => {
    beforeEach(() => {
        usageRulesState.canEdit = true
        usageRulesState.isLoading = false
        usageRulesState.usageRules = []
        useInventoryStore.setState({ editingUsageRule: null, isCreateUsageRuleDialogOpen: false })
    })

    afterEach(() => {
        cleanup()
    })

    it('does not render without write permission', () => {
        usageRulesState.canEdit = false

        const { container, rerender } = render(<InventoryUsageRulesCard />)
        rerender(<InventoryUsageRulesCard />)

        expect(container.textContent).toBe('')
    })

    it('renders loading and empty states', () => {
        usageRulesState.isLoading = true
        const { rerender } = render(<InventoryUsageRulesCard />)
        rerender(<InventoryUsageRulesCard />)

        expect(screen.getByText('Loading usage rules')).toBeTruthy()

        usageRulesState.isLoading = false
        rerender(<InventoryUsageRulesCard />)

        expect(screen.getByText('No usage rules yet.')).toBeTruthy()
        expect(screen.getByText('Create rule form')).toBeTruthy()
    })

    it('renders usage rules and opens edit state', async () => {
        const user = userEvent.setup()
        usageRulesState.usageRules = rules

        const { rerender } = render(<InventoryUsageRulesCard />)
        rerender(<InventoryUsageRulesCard />)

        expect(screen.getByText('Chicken Nuggets')).toBeTruthy()
        expect(screen.getByText('Party pies')).toBeTruthy()
        expect(screen.getByText('fairyBread')).toBeTruthy()
        expect(screen.getByText('2 per booking')).toBeTruthy()
        expect(screen.getByText('1 per child')).toBeTruthy()
        expect(screen.getByText('1 per booking + 0.5 per child')).toBeTruthy()

        await user.click(screen.getAllByRole('button', { name: 'Edit' })[0])

        expect(useInventoryStore.getState().editingUsageRule?.id).toBe('rule-1')
    })
})
