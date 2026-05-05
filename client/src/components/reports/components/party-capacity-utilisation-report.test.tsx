// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { PartyCapacityUtilisationReport } from './party-capacity-utilisation-report'

import type { ReactNode } from 'react'

const mutateAsync = vi.fn()
let currentOrg: 'master' | 'balwyn' = 'balwyn'
let isMutationError = false

vi.mock('@components/Session/use-org', () => ({
    useOrg: () => ({ currentOrg }),
}))

vi.mock('@utils/studioUtils', () => ({
    getOrgName: (org: string) => {
        if (org === 'master') return 'Corporate Studios'
        return `${org.charAt(0).toUpperCase()}${org.slice(1)} Studio`
    },
}))

vi.mock('@utils/trpc', () => ({
    useTRPC: () => ({
        reports: {
            generateCapacityReport: {
                mutationOptions: () => ({}),
            },
        },
    }),
}))

vi.mock('@tanstack/react-query', () => ({
    useMutation: () => ({
        mutateAsync,
        isPending: false,
        isError: isMutationError,
    }),
}))

vi.mock('@ui-components/popover', () => ({
    Popover: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    PopoverTrigger: ({ children }: { children: ReactNode }) => <>{children}</>,
    PopoverContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

vi.mock('@ui-components/calendar', () => ({
    Calendar: ({ onSelect, mode }: { onSelect: (range: unknown) => void; mode: string }) => (
        <div data-testid="capacity-calendar" data-mode={mode}>
            <button type="button" onClick={() => onSelect({ from: new Date('2026-04-01T00:00:00') })}>
                Select start date
            </button>
            <button
                type="button"
                onClick={() => onSelect({ from: new Date('2026-04-01T00:00:00'), to: new Date('2026-04-30T00:00:00') })}
            >
                Select full range
            </button>
        </div>
    ),
}))

describe('PartyCapacityUtilisationReport', () => {
    beforeEach(() => {
        currentOrg = 'balwyn'
        isMutationError = false
        mutateAsync.mockReset()
    })

    afterEach(() => {
        cleanup()
    })

    it('labels available slots as per studio when reporting on master', () => {
        currentOrg = 'master'

        render(<PartyCapacityUtilisationReport />)

        expect(screen.getByText('Available booking slots per studio')).toBeTruthy()
        expect(screen.getByText('Enter the slots available for each studio in the selected date range.')).toBeTruthy()
    })

    it('labels available slots normally when reporting on a studio', () => {
        currentOrg = 'balwyn'

        render(<PartyCapacityUtilisationReport />)

        expect(screen.getByText('Available booking slots')).toBeTruthy()
        expect(
            screen.getByText('Enter the total slots available for the selected date range and organisation.')
        ).toBeTruthy()
    })

    it('uses a range calendar for date selection', () => {
        render(<PartyCapacityUtilisationReport />)

        const calendar = screen.getByTestId('capacity-calendar')
        expect(calendar.dataset.mode).toBe('range')
    })

    it('submits the selected range, slots, and current studio then renders the result', async () => {
        currentOrg = 'balwyn'
        mutateAsync.mockResolvedValue({
            startDate: '2026-04-01',
            endDate: '2026-04-30',
            studio: 'balwyn',
            results: [
                {
                    studio: 'balwyn',
                    bookedSlots: 8,
                    availableSlots: 20,
                    utilisationPercentage: 40,
                },
            ],
        })

        const user = userEvent.setup()
        render(<PartyCapacityUtilisationReport />)

        await user.click(screen.getByText('Select full range'))
        await user.type(screen.getByLabelText('Available booking slots'), '20')
        await user.click(screen.getByRole('button', { name: 'Run report' }))

        await waitFor(() =>
            expect(mutateAsync).toHaveBeenCalledWith({
                startDate: '2026-04-01',
                endDate: '2026-04-30',
                availableSlots: 20,
                studio: 'balwyn',
            })
        )
        await waitFor(() => expect(screen.getAllByText('40%')).toHaveLength(2))
        expect(screen.getByText('Balwyn Studio from 1 April 2026 to 30 April 2026')).toBeTruthy()
        expect(screen.getByText('8 of 20 slots booked')).toBeTruthy()
    })

    it('renders one row per studio for master results', async () => {
        currentOrg = 'master'
        mutateAsync.mockResolvedValue({
            startDate: '2026-04-01',
            endDate: '2026-04-30',
            studio: 'master',
            results: [
                {
                    studio: 'balwyn',
                    bookedSlots: 17,
                    availableSlots: 20,
                    utilisationPercentage: 85,
                },
                {
                    studio: 'kingsville',
                    bookedSlots: 14,
                    availableSlots: 20,
                    utilisationPercentage: 70,
                },
            ],
        })

        const user = userEvent.setup()
        render(<PartyCapacityUtilisationReport />)

        await user.click(screen.getByText('Select full range'))
        await user.type(screen.getByLabelText('Available booking slots per studio'), '20')
        await user.click(screen.getByRole('button', { name: 'Run report' }))

        await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith(expect.objectContaining({ studio: 'master' })))
        expect(await screen.findByText('Balwyn Studio')).toBeTruthy()
        expect(screen.getByText('Kingsville Studio')).toBeTruthy()
        expect(screen.getByText('85%')).toBeTruthy()
        expect(screen.getByText('70%')).toBeTruthy()
    })
})
