import { describe, expect, it } from 'vite-plus/test'

import { filterAttendanceClassesForCurrentTerms, groupClasses, TERM_BOUNDARY_GAP_DAYS } from './session-grouping'

import type { LocalAcuityClass } from './cart-store'

const makeClass = (
    overrides: Omit<Partial<LocalAcuityClass>, 'time'> & { id: number; time: string }
): LocalAcuityClass => ({
    id: overrides.id,
    title: overrides.title ?? `Class ${overrides.id}`,
    calendarID: overrides.calendarID ?? 1,
    calendar: overrides.calendar ?? 'Balwyn',
    slotsAvailable: overrides.slotsAvailable ?? 10,
    time: new Date(overrides.time),
    appointmentTypeID: overrides.appointmentTypeID ?? 94471769,
    name: overrides.name ?? 'Preschool Program',
    description: overrides.description ?? '',
    price: overrides.price ?? '54',
    duration: overrides.duration ?? 150,
})

describe('preschool-v2 session grouping', () => {
    it('keeps weekly classes in one inferred term', () => {
        const groups = groupClasses(
            [
                makeClass({ id: 1, time: '2026-06-15T00:00:00.000Z' }),
                makeClass({ id: 2, time: '2026-06-22T00:00:00.000Z' }),
                makeClass({ id: 3, time: '2026-06-29T00:00:00.000Z' }),
            ],
            new Date('2026-06-01T00:00:00.000Z')
        )

        expect(groups).toHaveLength(1)
        expect(groups[0].classes.map((klass) => klass.id)).toEqual([1, 2, 3])
    })

    it('splits terms on a two-week-or-longer gap', () => {
        const groups = groupClasses(
            [
                makeClass({ id: 1, time: '2026-06-15T00:00:00.000Z' }),
                makeClass({ id: 2, time: '2026-06-29T00:00:00.000Z' }),
            ],
            new Date('2026-06-01T00:00:00.000Z')
        )

        expect(TERM_BOUNDARY_GAP_DAYS).toBe(14)
        expect(groups).toHaveLength(2)
        expect(groups.map((group) => group.classes.map((klass) => klass.id))).toEqual([[1], [2]])
    })

    it('marks a term as not full-term bookable after the first session has passed', () => {
        const groups = groupClasses(
            [
                makeClass({ id: 1, time: '2026-06-15T00:00:00.000Z' }),
                makeClass({ id: 2, time: '2026-06-22T00:00:00.000Z' }),
            ],
            new Date('2026-06-16T00:00:00.000Z')
        )

        expect(groups[0].isFullTermBookable).toBe(false)
        expect(groups[0].bookableClasses.map((klass) => klass.id)).toEqual([2])
    })

    it('marks a term as not full-term bookable when any session is full', () => {
        const groups = groupClasses(
            [
                makeClass({ id: 1, time: '2026-06-15T00:00:00.000Z' }),
                makeClass({ id: 2, slotsAvailable: 0, time: '2026-06-22T00:00:00.000Z' }),
            ],
            new Date('2026-06-01T00:00:00.000Z')
        )

        expect(groups[0].isFullTermBookable).toBe(false)
        expect(groups[0].bookableClasses.map((klass) => klass.id)).toEqual([1, 2])
    })

    it('shows previous attendance sessions only from an inferred term that is still active', () => {
        const classes = [
            makeClass({ id: 1, time: '2026-05-04T00:00:00.000Z' }),
            makeClass({ id: 2, time: '2026-05-11T00:00:00.000Z' }),
            makeClass({ id: 3, time: '2026-06-15T00:00:00.000Z' }),
            makeClass({ id: 4, time: '2026-06-22T00:00:00.000Z' }),
            makeClass({ id: 5, time: '2026-06-29T00:00:00.000Z' }),
            makeClass({ id: 6, time: '2026-09-07T00:00:00.000Z' }),
        ]
        const now = new Date('2026-06-24T00:00:00.000Z')

        expect(filterAttendanceClassesForCurrentTerms(classes, false, now).map((klass) => klass.id)).toEqual([5, 6])
        expect(filterAttendanceClassesForCurrentTerms(classes, true, now).map((klass) => klass.id)).toEqual([
            3, 4, 5, 6,
        ])
    })
})
