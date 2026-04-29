import type { FranchiseOrMaster } from '../core/studio'

export type GenerateTimesheetsParams = {
    startDateInput: string
    endDateInput: string
    studio: FranchiseOrMaster
}

export type ShiftUnderMinimumShiftLength = {
    employeeName: string
    positionName: string
    shiftDate: string
    workedLength: string
    minimumLength: string
    notes: string
}

export type GenerateTimesheetsResponse = {
    url: string
    skippedEmployees: string[]
    employeesWithBirthdayWhoWorked: string[]
    employeesWithBirthdayWhoDidNotWork: string[]
    employeesUnder18Over30Hrs: string[]
    shiftsUnderMinimumShiftLength: ShiftUnderMinimumShiftLength[]
}
