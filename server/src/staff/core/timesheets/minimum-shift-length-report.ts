import { isFranchise, type FranchiseOrMaster, type ShiftUnderMinimumShiftLength } from 'fizz-kidz'

import type { Timesheet, User } from '@/sling/sling.types'

import { getShiftsUnderMinimumShiftLength, SlingLocationsMap } from './timesheets.utils'

export function getShiftsUnderMinimumShiftLengthForTimesheets({
    studio,
    slingUsers,
    allTimesheets,
}: {
    studio: FranchiseOrMaster
    slingUsers: User[]
    allTimesheets: Timesheet[]
}) {
    const timesheets = allTimesheets
        .filter((it) => it.status === 'published')
        .filter((it) => {
            // depending on the franchise, filter out the location
            const slingLocation = SlingLocationsMap[it.location.id]
            if (studio === 'master') {
                if (slingLocation === 'head-office') return true
                return !isFranchise(slingLocation)
            }
            return slingLocation === studio
        })

    const shiftsUnderMinimumShiftLength: ShiftUnderMinimumShiftLength[] = []

    for (const slingUser of slingUsers) {
        const usersTimesheets = timesheets.filter((it) => it.user.id === slingUser.id)
        if (usersTimesheets.length === 0) continue

        shiftsUnderMinimumShiftLength.push(
            ...getShiftsUnderMinimumShiftLength({
                firstName: slingUser.legalName,
                lastName: slingUser.lastname,
                usersTimesheets,
                timezone: slingUser.timezone,
            })
        )
    }

    return shiftsUnderMinimumShiftLength
}
