// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { InventoryPage } from './inventory-page'

import type { ReactNode } from 'react'

vi.mock('@ui-components/tabs', () => {
    return {
        Tabs: ({ children }: { children: ReactNode }) => <div>{children}</div>,
        TabsContent: ({ children }: { children: ReactNode }) => <section>{children}</section>,
        TabsList: ({ children }: { children: ReactNode }) => <div>{children}</div>,
        TabsTrigger: ({ children }: { children: ReactNode }) => <button>{children}</button>,
    }
})

vi.mock('../hooks/use-inventory-data', () => ({
    useInventoryData: () => ({ itemCount: 12, trackedStockCount: 8 }),
}))

vi.mock('../components/inventory/inventory-catalogue-card', () => ({
    InventoryCatalogueCard: () => <div>Inventory catalogue card</div>,
}))

vi.mock('../components/shopping-list/inventory-shopping-list-card', () => ({
    InventoryShoppingListCard: () => <div>Shopping list card</div>,
}))

vi.mock('../components/usage-rules/inventory-usage-rules-card', () => ({
    InventoryUsageRulesCard: () => <div>Usage rules card</div>,
}))

vi.mock('../components/shared/inventory-dialogs', () => ({
    InventoryDialogs: () => <div>Inventory dialogs</div>,
}))

describe('InventoryPage', () => {
    it('renders the inventory tabs and page sections', () => {
        const { rerender } = render(<InventoryPage />)
        rerender(<InventoryPage />)

        expect(screen.getByText('Consumables stock')).toBeTruthy()
        expect(screen.getByText('12')).toBeTruthy()
        expect(screen.getByText('8')).toBeTruthy()
        expect(screen.getByRole('button', { name: 'Inventory' })).toBeTruthy()
        expect(screen.getByRole('button', { name: 'Shopping list' })).toBeTruthy()
        expect(screen.getByRole('button', { name: 'Usage rules' })).toBeTruthy()
        expect(screen.getByText('Inventory catalogue card')).toBeTruthy()
        expect(screen.getByText('Shopping list card')).toBeTruthy()
        expect(screen.getByText('Usage rules card')).toBeTruthy()
        expect(screen.getByText('Inventory dialogs')).toBeTruthy()
    })
})
