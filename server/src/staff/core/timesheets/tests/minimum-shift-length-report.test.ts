import { deepStrictEqual, strictEqual } from 'assert'

import type { Timesheet, User } from '@/sling/sling.types'

import { getShiftsUnderMinimumShiftLengthForTimesheets } from '../minimum-shift-length-report'
import { SlingLocationToId, SlingPosition, SlingPositionToId } from '../timesheets.utils'

function createSlingUser(overrides: Partial<User> = {}): User {
    return {
        id: 1,
        active: true,
        timezone: 'Australia/Melbourne',
        legalName: 'Ryan',
        name: 'Ryan Saffer',
        email: 'ryan@example.com',
        pending: null,
        lastname: 'Saffer',
        employeeId: 'employee-1',
        countryCode: '61',
        countryISOCode: 'AU',
        phone: '0400000000',
        role: 'employee',
        groupIds: [],
        ...overrides,
    }
}

function createTimesheet(overrides: Partial<Timesheet> = {}): Timesheet {
    return {
        status: 'published',
        dtstart: '2026-04-27T09:00:00+10:00',
        dtend: '2026-04-27T11:30:00+10:00',
        user: { id: 1 },
        position: { id: SlingPositionToId[SlingPosition.PARTY_FACILITATOR] },
        location: { id: SlingLocationToId.malvern },
        summary: '',
        ...overrides,
    }
}

describe('minimum shift length report', () => {
    it('returns under-minimum shifts for master studios and excludes franchise locations', () => {
        const slingUsers = [createSlingUser(), createSlingUser({ id: 2, legalName: 'Taylor', lastname: 'Jones' })]

        const result = getShiftsUnderMinimumShiftLengthForTimesheets({
            studio: 'master',
            slingUsers,
            allTimesheets: [
                createTimesheet({ location: { id: SlingLocationToId.malvern }, summary: 'Master studio shift' }),
                createTimesheet({
                    user: { id: 2 },
                    location: { id: SlingLocationToId['head-office'] },
                    summary: 'Head office shift',
                }),
                createTimesheet({ location: { id: SlingLocationToId.balwyn }, summary: 'Franchise shift' }),
            ],
        })

        strictEqual(result.length, 2)
        deepStrictEqual(
            result.map((shift) => shift.employeeName),
            ['Ryan Saffer', 'Taylor Jones']
        )
        deepStrictEqual(
            result.map((shift) => shift.notes),
            ['Master studio shift', 'Head office shift']
        )
    })

    it('returns under-minimum shifts only for the requested franchise studio', () => {
        const result = getShiftsUnderMinimumShiftLengthForTimesheets({
            studio: 'balwyn',
            slingUsers: [createSlingUser()],
            allTimesheets: [
                createTimesheet({ location: { id: SlingLocationToId.balwyn }, summary: 'Balwyn shift' }),
                createTimesheet({ location: { id: SlingLocationToId.malvern }, summary: 'Malvern shift' }),
                createTimesheet({ location: { id: SlingLocationToId['head-office'] }, summary: 'Head office shift' }),
            ],
        })

        strictEqual(result.length, 1)
        strictEqual(result[0].employeeName, 'Ryan Saffer')
        strictEqual(result[0].notes, 'Balwyn shift')
    })

    it('skips sling users that have no matching timesheets after filtering', () => {
        const result = getShiftsUnderMinimumShiftLengthForTimesheets({
            studio: 'balwyn',
            slingUsers: [createSlingUser(), createSlingUser({ id: 2, legalName: 'Taylor', lastname: 'Jones' })],
            allTimesheets: [createTimesheet({ location: { id: SlingLocationToId.balwyn }, summary: 'Balwyn shift' })],
        })

        strictEqual(result.length, 1)
        strictEqual(result[0].employeeName, 'Ryan Saffer')
        strictEqual(result[0].notes, 'Balwyn shift')
    })

    it('ignores unpublished shifts and uses the sling user timezone when building report rows', () => {
        const result = getShiftsUnderMinimumShiftLengthForTimesheets({
            studio: 'master',
            slingUsers: [createSlingUser({ timezone: 'Australia/Melbourne' })],
            allTimesheets: [
                createTimesheet({
                    dtstart: '2026-04-26T16:30:00Z',
                    dtend: '2026-04-26T19:00:00Z',
                    summary: 'Timezone-sensitive shift',
                }),
                createTimesheet({
                    status: 'draft' as unknown as Timesheet['status'],
                    summary: 'Draft shift',
                }),
            ],
        })

        strictEqual(result.length, 1)
        strictEqual(result[0].shiftDate, 'Mon 27/04/2026')
        strictEqual(result[0].workedLength, '2 hours 30 minutes')
        strictEqual(result[0].notes, 'Timezone-sensitive shift')
    })
})
