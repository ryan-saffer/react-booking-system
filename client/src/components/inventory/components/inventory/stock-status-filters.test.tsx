// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { StockStatusFilters } from './stock-status-filters'

describe('StockStatusFilters', () => {
    it('renders filter counts and emits selected values', async () => {
        const onChange = vi.fn()
        const user = userEvent.setup()

        const props = {
            value: 'running-low' as const,
            totalCount: 10,
            runningLowCount: 2,
            needsCountCount: 3,
            notRunningLowCount: 5,
            onChange,
        }
        const { rerender } = render(<StockStatusFilters {...props} />)
        rerender(<StockStatusFilters {...props} />)

        expect(screen.getByText('All stock')).toBeTruthy()
        expect(screen.getByText('10')).toBeTruthy()
        expect(screen.getByRole('button', { name: /Running low/ }).dataset.active).toBe('true')

        await user.click(screen.getByRole('button', { name: /Needs count/ }))

        expect(onChange).toHaveBeenCalledWith('needs-count')
    })
})
