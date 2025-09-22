import { ObjectKeys, assertNever } from 'fizz-kidz'
import { DateTime, Duration, Interval } from 'luxon'

import type { Rate, Timesheet as SlingTimesheet } from './timesheets.types'

/**
 * Breaks the range down into weeks, and returns them as an array of intervals.
 * If the range is not divisible by 7, the final interval will include only the remaining days.
 *
 * @param start
 * @param end
 */
export function getWeeks(_start: DateTime, end: DateTime) {
    const output: Interval[] = []
    let start = _start
    while (start <= end) {
        if (Interval.fromDateTimes(start, end).length('days') <= 6) {
            output.push(Interval.fromDateTimes(start, end))
        } else {
            output.push(Interval.after(start, Duration.fromObject({ days: 6 })))
        }
        start = start.plus({ days: 7 })
    }
    return output
}

/**
 * Returns true if dob is more than 18 years ago (relative to today)
 */
export function isYoungerThan18(dob: DateTime) {
    return DateTime.now().diff(dob, 'years').years < 18
}

/**
 * Returns an array of timesheet rows based on the users timesheets for that week.
 * Takes overtime into consideration.
 *
 * @param slingUser the user in sling
 * @param xeroUser the user in xero
 * @param usersTimesheets the users timesheets from sling
 * @returns an array of timesheet rows
 */
export function createTimesheetRows({
    firstName,
    lastName,
    dob,
    hasBirthdayDuringPayrun,
    isCasual,
    overtimeThreshold,
    usersTimesheets,
    rate,
    timezone,
}: {
    firstName: string
    lastName: string
    dob: DateTime
    hasBirthdayDuringPayrun: boolean
    isCasual: boolean
    overtimeThreshold: number
    usersTimesheets: SlingTimesheet[]
    rate: Rate
    timezone: string
}): { rows: TimesheetRow[]; totalHours: number } {
    const rows: TimesheetRow[] = []

    // keep track of hours worked this week
    let totalHours = 0

    usersTimesheets.map((timesheet) => {
        const position = PositionMap[timesheet.position.id]
        const location = LocationsMap[timesheet.location.id]
        const start = DateTime.fromISO(timesheet.dtstart, { zone: timezone })
        const end = DateTime.fromISO(timesheet.dtend, { zone: timezone })
        const shiftLengthInHours = end.diff(start, 'hours').hours

        // calculate if this shift puts employee into overtime for the week
        const hoursUntilWeeklyOvertime = overtimeThreshold - totalHours

        if (hoursUntilWeeklyOvertime > 0) {
            // overtime not yet reached

            const overtimeHours = shiftLengthInHours - hoursUntilWeeklyOvertime
            if (overtimeHours <= 0) {
                // entire shift fits before reaching overtime

                // any time above 10 hours in a single shift is overtime
                const isShiftAboveTenHours = shiftLengthInHours > 10
                const hoursAboveTen = shiftLengthInHours - 10

                // first add up to the first 10 hours
                rows.push(
                    new TimesheetRow({
                        firstName,
                        lastName,
                        dob,
                        hasBirthdayDuringPayrun,
                        date: start,
                        isCasual,
                        position,
                        location,
                        hours: isShiftAboveTenHours ? 10 : shiftLengthInHours,
                        summary: timesheet.summary,
                        rate,
                        overtime: { firstThreeHours: false, afterThreeHours: false },
                    })
                )

                // then add the remaining hours as overtime
                if (isShiftAboveTenHours) {
                    // check if the hours above 10 are more than 3 (to calculate first three vs after three hours)
                    const isMoreThanThreeHours = hoursAboveTen > 3

                    if (isMoreThanThreeHours) {
                        // first add the first three hours
                        rows.push(
                            new TimesheetRow({
                                firstName,
                                lastName,
                                dob,
                                hasBirthdayDuringPayrun,
                                date: start,
                                isCasual,
                                position,
                                location,
                                hours: 3,
                                summary: timesheet.summary,
                                rate,
                                overtime: { firstThreeHours: true, afterThreeHours: false },
                            })
                        )

                        // then the rest
                        rows.push(
                            new TimesheetRow({
                                firstName,
                                lastName,
                                dob,
                                hasBirthdayDuringPayrun,
                                date: start,
                                isCasual,
                                position,
                                location,
                                hours: hoursAboveTen - 3,
                                summary: timesheet.summary,
                                rate,
                                overtime: { firstThreeHours: false, afterThreeHours: true },
                            })
                        )
                    } else {
                        // all hours above 10 fit within first three hours
                        rows.push(
                            new TimesheetRow({
                                firstName,
                                lastName,
                                dob,
                                hasBirthdayDuringPayrun,
                                date: start,
                                isCasual,
                                position,
                                location,
                                hours: hoursAboveTen,
                                summary: timesheet.summary,
                                rate,
                                overtime: { firstThreeHours: true, afterThreeHours: false },
                            })
                        )
                    }
                }
            } else {
                // only part of the shift fits before reaching overtime.
                // add until overtime, and then add the rest as overtime
                rows.push(
                    new TimesheetRow({
                        firstName,
                        lastName,
                        dob,
                        hasBirthdayDuringPayrun,
                        isCasual,
                        date: start,
                        position,
                        location,
                        hours: hoursUntilWeeklyOvertime,
                        summary: timesheet.summary,
                        rate,
                        overtime: { firstThreeHours: false, afterThreeHours: false },
                    })
                )

                createOvertimeTimesheetRows(
                    shiftLengthInHours - hoursUntilWeeklyOvertime,
                    overtimeThreshold,
                    overtimeThreshold,
                    firstName,
                    lastName,
                    dob,
                    hasBirthdayDuringPayrun,
                    isCasual,
                    start,
                    position,
                    location,
                    rate,
                    timesheet.summary
                ).map((row) => rows.push(row))
            }
        } else {
            // already in overtime
            createOvertimeTimesheetRows(
                shiftLengthInHours,
                totalHours,
                overtimeThreshold,
                firstName,
                lastName,
                dob,
                hasBirthdayDuringPayrun,
                isCasual,
                start,
                position,
                location,
                rate,
                timesheet.summary
            ).map((row) => rows.push(row))
        }
        totalHours += shiftLengthInHours
    })

    return { rows, totalHours }
}

function createOvertimeTimesheetRows(
    hours: number,
    totalHours: number,
    overtimeThreshold: number,
    firstName: string,
    lastName: string,
    dob: DateTime,
    hasBirthdayDuringPayrun: boolean,
    isCasual: boolean,
    date: DateTime,
    position: Position,
    location: Location,
    rate: Rate,
    summary: string
) {
    const output: TimesheetRow[] = []

    // calculate if the hours puts employee into after three hours of overtime
    const hoursUntilAfterThreeHours = overtimeThreshold + 3 - totalHours

    if (hoursUntilAfterThreeHours > 0) {
        // after three hours not yet reached
        const afterThreeHours = hours - hoursUntilAfterThreeHours
        if (afterThreeHours <= 0) {
            // entire time fits before reaching after three hours
            output.push(
                new TimesheetRow({
                    firstName,
                    lastName,
                    dob,
                    hasBirthdayDuringPayrun,
                    isCasual,
                    date,
                    position,
                    location,
                    hours,
                    summary,
                    rate,
                    overtime: { firstThreeHours: true, afterThreeHours: false },
                })
            )
        } else {
            // only part of the shift fits before reaching after three hours.
            // add until after three hours, and then add the rest as after three hours
            output.push(
                new TimesheetRow({
                    firstName,
                    lastName,
                    dob,
                    hasBirthdayDuringPayrun,
                    isCasual,
                    date,
                    position,
                    location,
                    hours: hoursUntilAfterThreeHours,
                    summary,
                    rate,
                    overtime: { firstThreeHours: true, afterThreeHours: false },
                })
            )
            output.push(
                new TimesheetRow({
                    firstName,
                    lastName,
                    dob,
                    hasBirthdayDuringPayrun,
                    isCasual,
                    date,
                    position,
                    location,
                    hours: afterThreeHours,
                    summary,
                    rate,
                    overtime: { firstThreeHours: false, afterThreeHours: true },
                })
            )
        }
    } else {
        // already after three hours
        output.push(
            new TimesheetRow({
                firstName,
                lastName,
                dob,
                hasBirthdayDuringPayrun,
                isCasual,
                date,
                position,
                location,
                hours,
                summary,
                rate,
                overtime: { firstThreeHours: false, afterThreeHours: true },
            })
        )
    }

    return output
}

type Overtime =
    | { firstThreeHours: false; afterThreeHours: false }
    | { firstThreeHours: true; afterThreeHours: false }
    | { firstThreeHours: false; afterThreeHours: true }

export class TimesheetRow {
    firstName: string
    lastname: string
    dob: DateTime
    hasBirthdayDuringPayrun: boolean
    payItem: PayItem
    date: DateTime
    isCasual: boolean
    hours: number
    overtime: Overtime
    rate: Rate
    summary: string
    position: Position
    activity: XeroTrackingActivity

    constructor({
        firstName,
        lastName,
        dob,
        hasBirthdayDuringPayrun,
        date,
        position,
        location,
        isCasual,
        hours,
        overtime,
        rate,
        summary,
    }: {
        firstName: string
        lastName: string
        dob: DateTime
        hasBirthdayDuringPayrun: boolean
        date: DateTime
        position: Position
        location: Location
        isCasual: boolean
        hours: number
        overtime: Overtime
        rate: Rate
        summary: string
    }) {
        this.firstName = firstName
        this.lastname = lastName
        this.dob = dob
        this.hasBirthdayDuringPayrun = hasBirthdayDuringPayrun
        this.date = date
        this.isCasual = isCasual
        this.hours = hours
        this.overtime = overtime
        this.rate = rate
        this.summary = summary
        this.position = position

        // calculate pay item
        this.payItem = this.getPayItem(position, location)

        // map to activity
        this.activity = PositionToActivityMap[position]
    }

    private getPayItem(position: Position, location: Location): PayItem {
        if (this.overtime.firstThreeHours) return this._getOvertimeFirstThreeHours(location)
        if (this.overtime.afterThreeHours) return this._getOvertimeAfterThreeHours(location)
        if (position === Position.ON_CALL) return this._getOnCallPayItem(location)
        if (
            position === Position.CALLED_IN_PARTY_FACILITATOR ||
            position === Position.CALLED_IN_HOLIDAY_PROGRAM_FACILITATOR ||
            position === Position.CALLED_IN_PLAY_LAB_FACILITATOR
        )
            return this._getCalledInPayItem(location)

        return this._getOrdinaryPayItem(location)
    }

    private _isMonSat() {
        // Sunday is 7
        return this.date.weekday !== 7
    }

    private _isYoungerThan18() {
        return isYoungerThan18(this.dob)
    }

    // determine if the employees rate, when working mon-sat (1.25x) is above $18.00
    private _isRateAbove18() {
        if (this.rate === 'not required') return false
        return this.rate * 1.25 >= 18
    }

    private _isCOGSShift() {
        switch (this.position) {
            case Position.MISCELLANEOUS:
            case Position.SUNDAY_MISCELLANEOUS:
            case Position.TRAINING:
            case Position.SUNDAY_TRAINING:
            case Position.SUPERVISOR:
            case Position.SUNDAY_SUPERVISOR:
                return false
            case Position.PARTY_FACILITATOR:
            case Position.SUNDAY_PARTY_FACILITATOR:
            case Position.ON_CALL_PARTY_FACILITATOR:
            case Position.CALLED_IN_PARTY_FACILITATOR:
            case Position.SUNDAY_ON_CALL_PARTY_FACILITATOR:
            case Position.SUNDAY_CALLED_IN_PARTY_FACILITATOR:
            case Position.MOBILE_PARTY_FACILITATOR:
            case Position.SUNDAY_MOBILE_PARTY_FACILITATOR:
            case Position.ON_CALL_MOBILE_PARTY_FACILITATOR:
            case Position.CALLED_IN_MOBILE_PARTY_FACILITATOR:
            case Position.SUNDAY_ON_CALL_MOBILE_PARTY_FACILITATOR:
            case Position.SUNDAY_CALLED_IN_MOBILE_PARTY_FACILITATOR:
            case Position.HOLIDAY_PROGRAM_FACILITATOR:
            case Position.SUNDAY_HOLIDAY_PROGRAM_FACILITATOR:
            case Position.ON_CALL_HOLIDAY_PROGRAM_FACILITATOR:
            case Position.CALLED_IN_HOLIDAY_PROGRAM_FACILITATOR:
            case Position.SUNDAY_ON_CALL_HOLIDAY_PROGRAM_FACILITATOR:
            case Position.SUNDAY_CALLED_IN_HOLIDAY_PROGRAM_FACILITATOR:
            case Position.AFTER_SCHOOL_PROGRAM_FACILITATOR:
            case Position.SUNDAY_AFTER_SCHOOL_FACILITATOR:
            case Position.ON_CALL_AFTER_SCHOOL_PROGRAM_FACILITATOR:
            case Position.CALLED_IN_AFTER_SCHOOL_PROGRAM_FACILITATOR:
            case Position.SUNDAY_ON_CALL_AFTER_SCHOOL_PROGRAM_FACILITATOR:
            case Position.SUNDAY_CALLED_IN_AFTER_SCHOOL_PROGRAM_FACILITATOR:
            case Position.PLAY_LAB_FACILITATOR:
            case Position.SUNDAY_PLAY_LAB_FACILITATOR:
            case Position.ON_CALL_PLAY_LAB_FACILITATOR:
            case Position.CALLED_IN_PLAY_LAB_FACILITATOR:
            case Position.SUNDAY_ON_CALL_PLAY_LAB_FACILITATOR:
            case Position.SUNDAY_CALLED_IN_PLAY_LAB_FACILITATOR:
            case Position.EVENTS_AND_ACTIVATIONS:
            case Position.SUNDAY_EVENTS_AND_ACTIVATIONS:
            case Position.ON_CALL_EVENTS_AND_ACTIVATIONS:
            case Position.CALLED_IN_EVENTS_AND_ACTIVATIONS:
            case Position.SUNDAY_ON_CALL_EVENTS_AND_ACTIVATIONS:
            case Position.SUNDAY_CALLED_IN_EVENTS_AND_ACTIVATIONS:
            case Position.INCURSIONS:
            case Position.SUNDAY_INCURSIONS:
            case Position.ON_CALL_INCURSIONS:
            case Position.CALLED_IN_INCURSIONS:
            case Position.SUNDAY_ON_CALL_INCURSIONS:
            case Position.SUNDAY_CALLED_IN_INCURSIONS:
            case Position.ON_CALL:
                return true
            default: {
                assertNever(this.position)
                throw new Error(`Unhandled position while determining COGS shift: '${this.position}'`)
            }
        }
    }

    private _getOrdinaryPayItem(location: Location): OrdinaryPayItem {
        if (this.isCasual) {
            // CASUAL EMPLOYEES
            if (this._isMonSat()) {
                if (this._isYoungerThan18() && !this._isRateAbove18()) {
                    switch (location) {
                        case Location.BALWYN:
                            return this._isCOGSShift()
                                ? 'CGS 16&17yo COH - Mon to Sat - Balwyn'
                                : 'NON-CGS 16&17yo COH - Mon to Sat - Balwyn'
                        case Location.CHELTENHAM:
                            return this._isCOGSShift()
                                ? 'CGS 16&17yo COH - Mon to Sat - Cheltenham'
                                : 'NON-CGS 16&17yo COH - Mon to Sat - Cheltenham'
                        case Location.ESSENDON:
                            return this._isCOGSShift()
                                ? 'CGS 16&17yo COH - Mon to Sat - Essendon'
                                : 'NON-CGS 16&17yo COH - Mon to Sat - Essendon'
                        case Location.KINGSVILLE:
                            return this._isCOGSShift()
                                ? 'CGS 16&17yo COH - Mon to Sat - Kingsville'
                                : 'NON-CGS 16&17yo COH - Mon to Sat - Kingsville'
                        case Location.MALVERN:
                            return this._isCOGSShift()
                                ? 'CGS 16&17yo COH - Mon to Sat - Malvern'
                                : 'NON-CGS 16&17yo COH - Mon to Sat - Malvern'
                        case Location.MOBILE:
                            return this._isCOGSShift()
                                ? 'CGS 16&17yo COH - Mon to Sat - Head Office'
                                : 'NON-CGS 16&17yo COH - Mon to Sat - Head Office'
                        default: {
                            assertNever(location)
                            throw new Error(`Unrecognised location processing payroll: ${location}`)
                        }
                    }
                } else {
                    switch (location) {
                        case Location.BALWYN:
                            return this._isCOGSShift()
                                ? 'CGS COH - Mon to Sat - Balwyn'
                                : 'NON-CGS COH - Mon to Sat - Balwyn'
                        case Location.CHELTENHAM:
                            return this._isCOGSShift()
                                ? 'CGS COH - Mon to Sat - Cheltenham'
                                : 'NON-CGS COH - Mon to Sat - Cheltenham'
                        case Location.ESSENDON:
                            return this._isCOGSShift()
                                ? 'CGS COH - Mon to Sat - Essendon'
                                : 'NON-CGS COH - Mon to Sat - Essendon'
                        case Location.KINGSVILLE:
                            return this._isCOGSShift()
                                ? 'CGS COH - Mon to Sat - Kingsville'
                                : 'NON-CGS COH - Mon to Sat - Kingsville'
                        case Location.MALVERN:
                            return this._isCOGSShift()
                                ? 'CGS COH - Mon to Sat - Malvern'
                                : 'NON-CGS COH - Mon to Sat - Malvern'
                        case Location.MOBILE:
                            return this._isCOGSShift()
                                ? 'CGS COH - Mon to Sat - Head Office'
                                : 'NON-CGS COH - Mon to Sat - Head Office'
                        default: {
                            assertNever(location)
                            throw new Error(`Unrecognised location processing payroll: ${location}`)
                        }
                    }
                }
            } else {
                switch (location) {
                    case Location.BALWYN:
                        return this._isCOGSShift() ? 'CGS COH - Sunday - Balwyn' : 'NON-CGS COH - Sunday - Balwyn'
                    case Location.CHELTENHAM:
                        return this._isCOGSShift()
                            ? 'CGS COH - Sunday - Cheltenham'
                            : 'NON-CGS COH - Sunday - Cheltenham'
                    case Location.ESSENDON:
                        return this._isCOGSShift() ? 'CGS COH - Sunday - Essendon' : 'NON-CGS COH - Sunday - Essendon'
                    case Location.KINGSVILLE:
                        return this._isCOGSShift()
                            ? 'CGS COH - Sunday - Kingsville'
                            : 'NON-CGS COH - Sunday - Kingsville'
                    case Location.MALVERN:
                        return this._isCOGSShift() ? 'CGS COH - Sunday - Malvern' : 'NON-CGS COH - Sunday - Malvern'
                    case Location.MOBILE:
                        return this._isCOGSShift()
                            ? 'CGS COH - Sunday - Head Office'
                            : 'NON-CGS COH - Sunday - Head Office'
                    default: {
                        assertNever(location)
                        throw new Error(`Unrecognised location processing payroll: ${location}`)
                    }
                }
            }
        } else {
            // PT/FT EMPLOYEES
            if (this._isMonSat()) {
                switch (location) {
                    case Location.BALWYN:
                        return 'PT/FT Ordinary Hours - Mon to Sat - Balwyn'
                    case Location.CHELTENHAM:
                        return 'PT/FT Ordinary Hours - Mon to Sat - Chelt'
                    case Location.ESSENDON:
                        return 'PT/FT Ordinary Hours - Mon to Sat - Essendon'
                    case Location.KINGSVILLE:
                        return 'PT/FT Ordinary Hours - Mon to Sat - Kingsville'
                    case Location.MALVERN:
                        return 'PT/FT Ordinary Hours - Mon to Sat - Malvern'
                    case Location.MOBILE:
                        return 'PT/FT Ordinary Hours - Mon to Sat - Head Office'
                    default: {
                        assertNever(location)
                        throw new Error(`Unrecognised location processing payroll: ${location}`)
                    }
                }
            } else {
                switch (location) {
                    case Location.BALWYN:
                        return 'PT/FT Ordinary Hours - Sunday - Balwyn'
                    case Location.CHELTENHAM:
                        return 'PT/FT Ordinary Hours - Sunday - Chelt'
                    case Location.ESSENDON:
                        return 'PT/FT Ordinary Hours - Sunday - Essendon'
                    case Location.KINGSVILLE:
                        return 'PT/FT Ordinary Hours - Sunday - Kingsville'
                    case Location.MALVERN:
                        return 'PT/FT Ordinary Hours - Sunday - Malvern'
                    case Location.MOBILE:
                        return 'PT/FT Ordinary Hours - Sunday - Head Office'
                    default: {
                        assertNever(location)
                        throw new Error(`Unrecognised location processing payroll: ${location}`)
                    }
                }
            }
        }
    }

    private _getOnCallPayItem(location: Location): OnCallPayItem {
        // all 'on calls' are COGS
        if (this._isMonSat()) {
            if (this._isYoungerThan18() && !this._isRateAbove18()) {
                switch (location) {
                    case Location.BALWYN:
                        return 'On call - 16&17yo Csl Or Hs - Mon to Sat - Balw'
                    case Location.CHELTENHAM:
                        return 'On call - 16&17yo Csl Or Hs - Mon to Sat - Chelt'
                    case Location.ESSENDON:
                        return 'On call - 16&17yo Csl Or Hs - Mon to Sat - Essen'
                    case Location.KINGSVILLE:
                        return 'On call - 16&17yo Csl Or Hs - Mon to Sat - Kings'
                    case Location.MALVERN:
                        return 'On call - 16&17yo Csl Or Hs - Mon to Sat - Malvern'
                    case Location.MOBILE:
                        return 'On call - 16&17yo Csl Or Hs - Mon to Sat - HO'
                    default: {
                        assertNever(location)
                        throw new Error(`Unrecognised location processing payroll: ${location}`)
                    }
                }
            } else {
                switch (location) {
                    case Location.BALWYN:
                        return 'ON CALL - Cas Ord Hrs - Mon to Sat - Balwyn'
                    case Location.CHELTENHAM:
                        return 'ON CALL - Cas Ord Hrs - Mon to Sat - Chelt'
                    case Location.ESSENDON:
                        return 'ON CALL - Cas Ord Hrs - Mon to Sat - Essen'
                    case Location.KINGSVILLE:
                        return 'ON CALL - Cas Ord Hrs - Mon to Sat - Kingsville'
                    case Location.MALVERN:
                        return 'ON CALL - Cas Ord Hrs - Mon to Sat - Malv'
                    case Location.MOBILE:
                        return 'ON CALL - Cas Ord Hrs - Mon to Sat - Head Office'
                    default: {
                        assertNever(location)
                        throw new Error(`Unrecognised location processing payroll: ${location}`)
                    }
                }
            }
        } else {
            switch (location) {
                case Location.BALWYN:
                    return 'ON CALL - Cas Ord Hrs - Sunday - Balwyn'
                case Location.CHELTENHAM:
                    return 'ON CALL - Cas Ord Hrs - Sunday - Chelt'
                case Location.ESSENDON:
                    return 'ON CALL - Cas Ord Hrs - Sunday - Essend'
                case Location.KINGSVILLE:
                    return 'ON CALL - Cas Ord Hrs - Sunday - Kingsville'
                case Location.MALVERN:
                    return 'ON CALL - Cas Ord Hrs - Sunday - Malvern'
                case Location.MOBILE:
                    return 'ON CALL - Cas Ord Hrs - Sunday - Head Office'
                default: {
                    assertNever(location)
                    throw new Error(`Unrecognised location processing payroll: ${location}`)
                }
            }
        }
    }

    private _getCalledInPayItem(location: Location): CalledInPayItem {
        // all called in are COGS
        if (this._isMonSat()) {
            if (this._isYoungerThan18() && !this._isRateAbove18()) {
                switch (location) {
                    case Location.BALWYN:
                        return 'CALLEDIN - 16&17 Cas Ord Hrs - Mon to Sat - Balw'
                    case Location.CHELTENHAM:
                        return 'CALLEDIN - 16&17 Cas Ord Hrs - Mon to Sat - Chelt'
                    case Location.ESSENDON:
                        return 'CALLEDIN - 16&17 Cas Ord Hrs - Mon to Sat - Essen'
                    case Location.KINGSVILLE:
                        return 'CALLEDIN - 16&17 Cas Ord Hrs - Mon to Sat - Kings'
                    case Location.MALVERN:
                        return 'CALLEDIN - 16&17 Cas Ord Hrs - Mon to Sat - Malv'
                    case Location.MOBILE:
                        return 'CALLEDIN - 16&17 COH - Mon to Sat - HO'
                    default: {
                        assertNever(location)
                        throw new Error(`Unrecognised location processing payroll: ${location}`)
                    }
                }
            } else {
                switch (location) {
                    case Location.BALWYN:
                        return 'CALLEDIN - Cas Ord Hrs - Mon to Sat - Balwyn'
                    case Location.CHELTENHAM:
                        return 'CALLEDIN - Cas Ord Hrs - Mon to Sat - Chelt'
                    case Location.ESSENDON:
                        return 'CALLEDIN - Cas Ord Hrs - Mon to Sat - Essen'
                    case Location.KINGSVILLE:
                        return 'CALLEDIN - Cas Ord Hrs - Mon to Sat - Kingsville'
                    case Location.MALVERN:
                        return 'CALLEDIN - Cas Ord Hrs - Mon to Sat - Malvern'
                    case Location.MOBILE:
                        return 'CALLEDIN - Cas Ord Hrs - Mon to Sat - Head Office'
                    default: {
                        assertNever(location)
                        throw new Error(`Unrecognised location processing payroll: ${location}`)
                    }
                }
            }
        } else {
            switch (location) {
                case Location.BALWYN:
                    return 'CALLEDIN - Cas Ord Hrs - Sun - Balwyn'
                case Location.CHELTENHAM:
                    return 'CALLEDIN - Cas Ord Hrs - Sun - Chelt'
                case Location.ESSENDON:
                    return 'CALLEDIN - Cas Ord Hrs - Sun - Essend'
                case Location.KINGSVILLE:
                    return 'CALLEDIN - Cas Ord Hrs - Sun - Kingsville'
                case Location.MALVERN:
                    return 'CALLEDIN - Cas Ord Hrs - Sun - Malvern'
                case Location.MOBILE:
                    return 'CALLEDIN - Cas Ord Hrs - Sun - Head Office'
                default: {
                    assertNever(location)
                    throw new Error(`Unrecognised location processing payroll: ${location}`)
                }
            }
        }
    }

    private _getOvertimeFirstThreeHours(location: Location): OvertimeFirstThreeHours {
        if (this._isMonSat()) {
            switch (location) {
                case Location.BALWYN:
                    return this._isCOGSShift()
                        ? 'CGS OT - First 3 Hrs - Mon to Sat - Balwyn'
                        : 'NON-CGS OT - First 3 Hrs - Mon to Sat - Balwyn'
                case Location.CHELTENHAM:
                    return this._isCOGSShift()
                        ? 'CGS OT - First 3 Hrs - Mon to Sat - Cheltenham'
                        : 'NON-CGS OT - First 3 Hrs - Mon to Sat - Cheltenham'
                case Location.ESSENDON:
                    return this._isCOGSShift()
                        ? 'CGS OT - First 3 Hrs - Mon to Sat - Essendon'
                        : 'NON-CGS OT - First 3 Hrs - Mon to Sat - Essendon'
                case Location.KINGSVILLE:
                    return this._isCOGSShift()
                        ? 'CGS OT - First 3 Hrs - Mon to Sat - Kingsville'
                        : 'NON-CGS OT - First 3 Hrs - Mon to Sat - Kingsville'
                case Location.MALVERN:
                    return this._isCOGSShift()
                        ? 'CGS OT - First 3 Hrs - Mon to Sat - Malvern'
                        : 'NON-CGS OT - First 3 Hrs - Mon to Sat - Malvern'
                case Location.MOBILE:
                    return this._isCOGSShift()
                        ? 'CGS OT - First 3 Hrs - Mon to Sat - Head Office'
                        : 'NON-CGS OT - First 3 Hrs - Mon to Sat - HO'
                default: {
                    assertNever(location)
                    throw new Error(`Unrecognised location processing payroll: ${location}`)
                }
            }
        } else {
            switch (location) {
                case Location.BALWYN:
                    return this._isCOGSShift()
                        ? 'CGS OT - First 3 Hrs - Sunday - Balwyn'
                        : 'NON-CGS OT - First 3 Hrs - Sunday - Balwyn'
                case Location.CHELTENHAM:
                    return this._isCOGSShift()
                        ? 'CGS OT - First 3 Hrs - Sunday - Cheltenham'
                        : 'NON-CGS OT - First 3 Hrs - Sunday - Cheltenham'
                case Location.ESSENDON:
                    return this._isCOGSShift()
                        ? 'CGS OT - First 3 Hrs - Sunday - Essendon'
                        : 'NON-CGS OT - First 3 Hrs - Sunday - Essendon'
                case Location.KINGSVILLE:
                    return this._isCOGSShift()
                        ? 'CGS OT - First 3 Hrs - Sunday - Kingsville'
                        : 'NON-CGS OT - First 3 Hrs - Sunday - Kingsville'
                case Location.MALVERN:
                    return this._isCOGSShift()
                        ? 'CGS OT - First 3 Hrs - Sunday - Malvern'
                        : 'NON-CGS OT - First 3 Hrs - Sunday - Malvern'
                case Location.MOBILE:
                    return this._isCOGSShift()
                        ? 'CGS OT - First 3 Hrs - Sunday - Head Office'
                        : 'NON-CGS OT - First 3 Hrs - Sunday - Head Office'
                default: {
                    assertNever(location)
                    throw new Error(`Unrecognised location processing payroll: ${location}`)
                }
            }
        }
    }

    private _getOvertimeAfterThreeHours(location: Location): OvertimeAfterThreeHours {
        switch (location) {
            case Location.BALWYN:
                return this._isCOGSShift() ? 'CGS OT - After 3 Hrs - Balwyn' : 'NON-CGS OT - After 3 Hrs - Balwyn'
            case Location.CHELTENHAM:
                return this._isCOGSShift()
                    ? 'CGS OT - After 3 Hrs - Cheltenham'
                    : 'NON-CGS OT - After 3 Hrs - Cheltenham'
            case Location.ESSENDON:
                return this._isCOGSShift() ? 'CGS OT - After 3 Hrs - Essendon' : 'NON-CGS OT - After 3 Hrs - Essendon'
            case Location.KINGSVILLE:
                return this._isCOGSShift()
                    ? 'CGS OT - After 3 Hrs - Kingsville'
                    : 'NON-CGS OT - After 3 Hrs - Kingsville'
            case Location.MALVERN:
                return this._isCOGSShift() ? 'CGS OT - After 3 Hrs - Malvern' : 'NON-CGS OT - After 3 Hrs - Malvern'
            case Location.MOBILE:
                return this._isCOGSShift()
                    ? 'CGS OT - After 3 Hrs - Head Office'
                    : 'NON-CGS OT - After 3 Hrs - Head Office'
        }
    }
}

/**
 * Tells you if a birthday falls between two dates.
 *
 * @param dob the date of birth
 * @param start start of the range
 * @param end end of the range
 * @returns true if users birthday falls within the range, false otherwise
 */
export function hasBirthdayDuring(dob: DateTime, start: DateTime, end: DateTime) {
    let year = start.year

    while (year <= end.year) {
        const nextBirthday = DateTime.fromObject({
            year,
            month: dob.month,
            day: dob.day,
        })

        if (start <= nextBirthday && nextBirthday <= end) {
            return true
        }

        year++
    }

    return false
}

export enum Location {
    BALWYN = 'BALWYN',
    CHELTENHAM = 'CHELTENHAM',
    ESSENDON = 'ESSENDON',
    KINGSVILLE = 'KINGSVILLE',
    MALVERN = 'MALVERN',
    MOBILE = 'MOBILE', // deprecated. Remove once location in sling not being used anymore.
}

export enum Position {
    PARTY_FACILITATOR = 'PARTY_FACILITATOR',
    MOBILE_PARTY_FACILITATOR = 'MOBILE_PARTY_FACILITATOR',
    AFTER_SCHOOL_PROGRAM_FACILITATOR = 'AFTER_SCHOOL_PROGRAM_FACILITATOR',
    HOLIDAY_PROGRAM_FACILITATOR = 'HOLIDAY_PROGRAM_FACILITATOR',
    PLAY_LAB_FACILITATOR = 'PLAY_LAB_FACILITATOR',
    EVENTS_AND_ACTIVATIONS = 'EVENTS_AND_ACTIVATIONS',
    INCURSIONS = 'INCURSIONS',
    ON_CALL_PARTY_FACILITATOR = 'ON_CALL_PARTY_FACILITATOR',
    ON_CALL_MOBILE_PARTY_FACILITATOR = 'ON_CALL_MOBILE_PARTY_FACILITATOR',
    ON_CALL_AFTER_SCHOOL_PROGRAM_FACILITATOR = 'ON_CALL_AFTER_SCHOOL_PROGRAM_FACILITATOR',
    ON_CALL_HOLIDAY_PROGRAM_FACILITATOR = 'ON_CALL_HOLIDAY_PROGRAM_FACILITATOR',
    ON_CALL_PLAY_LAB_FACILITATOR = 'ON_CALL_PLAY_LAB_FACILITATOR',
    ON_CALL_EVENTS_AND_ACTIVATIONS = 'ON_CALL_EVENTS_AND_ACTIVATIONS',
    ON_CALL_INCURSIONS = 'ON_CALL_INCURSIONS',
    CALLED_IN_PARTY_FACILITATOR = 'CALLED_IN_PARTY_FACILITATOR',
    CALLED_IN_MOBILE_PARTY_FACILITATOR = 'CALLED_IN_MOBILE_PARTY_FACILITATOR',
    CALLED_IN_AFTER_SCHOOL_PROGRAM_FACILITATOR = 'CALLED_IN_AFTER_SCHOOL_PROGRAM_FACILITATOR',
    CALLED_IN_HOLIDAY_PROGRAM_FACILITATOR = 'CALLED_IN_HOLIDAY_PROGRAM_FACILITATOR',
    CALLED_IN_PLAY_LAB_FACILITATOR = 'CALLED_IN_PLAY_LAB_FACILITATOR',
    CALLED_IN_EVENTS_AND_ACTIVATIONS = 'CALLED_IN_EVENTS_AND_ACTIVATIONS',
    CALLED_IN_INCURSIONS = 'CALLED_IN_INCURSIONS',
    SUNDAY_PARTY_FACILITATOR = 'SUNDAY_PARTY_FACILITATOR',
    SUNDAY_MOBILE_PARTY_FACILITATOR = 'SUNDAY_MOBILE_PARTY_FACILITATOR',
    SUNDAY_AFTER_SCHOOL_FACILITATOR = 'SUNDAY_AFTER_SCHOOL_FACILITATOR',
    SUNDAY_HOLIDAY_PROGRAM_FACILITATOR = 'SUNDAY_HOLIDAY_PROGRAM_FACILITATOR',
    SUNDAY_PLAY_LAB_FACILITATOR = 'SUNDAY_PLAY_LAB_FACILITATOR',
    SUNDAY_EVENTS_AND_ACTIVATIONS = 'SUNDAY_EVENTS_AND_ACTIVATIONS',
    SUNDAY_INCURSIONS = 'SUNDAY_INCURSIONS',
    SUNDAY_ON_CALL_PARTY_FACILITATOR = 'SUNDAY_ON_CALL_PARTY_FACILITATOR',
    SUNDAY_ON_CALL_MOBILE_PARTY_FACILITATOR = 'SUNDAY_ON_CALL_MOBILE_PARTY_FACILITATOR',
    SUNDAY_ON_CALL_AFTER_SCHOOL_PROGRAM_FACILITATOR = 'SUNDAY_ON_CALL_AFTER_SCHOOL_PROGRAM_FACILITATOR',
    SUNDAY_ON_CALL_HOLIDAY_PROGRAM_FACILITATOR = 'SUNDAY_ON_CALL_HOLIDAY_PROGRAM_FACILITATOR',
    SUNDAY_ON_CALL_PLAY_LAB_FACILITATOR = 'SUNDAY_ON_CALL_PLAY_LAB_FACILITATOR',
    SUNDAY_ON_CALL_EVENTS_AND_ACTIVATIONS = 'SUNDAY_ON_CALL_EVENTS_AND_ACTIVATIONS',
    SUNDAY_ON_CALL_INCURSIONS = 'SUNDAY_ON_CALL_INCURSIONS',
    SUNDAY_CALLED_IN_PARTY_FACILITATOR = 'SUNDAY_CALLED_IN_PARTY_FACILITATOR',
    SUNDAY_CALLED_IN_MOBILE_PARTY_FACILITATOR = 'SUNDAY_CALLED_IN_MOBILE_PARTY_FACILITATOR',
    SUNDAY_CALLED_IN_AFTER_SCHOOL_PROGRAM_FACILITATOR = 'SUNDAY_CALLED_IN_AFTER_SCHOOL_PROGRAM_FACILITATOR',
    SUNDAY_CALLED_IN_HOLIDAY_PROGRAM_FACILITATOR = 'SUNDAY_CALLED_IN_HOLIDAY_PROGRAM_FACILITATOR',
    SUNDAY_CALLED_IN_PLAY_LAB_FACILITATOR = 'SUNDAY_CALLED_IN_PLAY_LAB_FACILITATOR',
    SUNDAY_CALLED_IN_EVENTS_AND_ACTIVATIONS = 'SUNDAY_CALLED_IN_EVENTS_AND_ACTIVATIONS',
    SUNDAY_CALLED_IN_INCURSIONS = 'SUNDAY_CALLED_IN_INCURSIONS',
    TRAINING = 'TRAINING', // NOT COGS
    MISCELLANEOUS = 'MISCELLANEOUS', //  manager duties etc NOT COGS
    SUNDAY_TRAINING = 'SUNDAY_TRAINING',
    SUNDAY_MISCELLANEOUS = 'SUNDAY_MISCELLANEOUS',
    SUPERVISOR = 'SUPERVISOR',
    SUNDAY_SUPERVISOR = 'SUNDAY_SUPERVISOR',
    ON_CALL = 'ON_CALL', // deprecated
}

const PositionToId: Record<Position, number> = {
    [Position.PARTY_FACILITATOR]: 4809533,
    [Position.MOBILE_PARTY_FACILITATOR]: 25261610,
    [Position.AFTER_SCHOOL_PROGRAM_FACILITATOR]: 5206290,
    [Position.HOLIDAY_PROGRAM_FACILITATOR]: 5557194,
    [Position.PLAY_LAB_FACILITATOR]: 23638376,
    [Position.EVENTS_AND_ACTIVATIONS]: 22914259,
    [Position.INCURSIONS]: 25288121,
    [Position.ON_CALL_PARTY_FACILITATOR]: 25262039,
    [Position.ON_CALL_MOBILE_PARTY_FACILITATOR]: 25262063,
    [Position.ON_CALL_AFTER_SCHOOL_PROGRAM_FACILITATOR]: 25262076,
    [Position.ON_CALL_HOLIDAY_PROGRAM_FACILITATOR]: 25262047,
    [Position.ON_CALL_PLAY_LAB_FACILITATOR]: 25262094,
    [Position.ON_CALL_EVENTS_AND_ACTIVATIONS]: 25262054,
    [Position.ON_CALL_INCURSIONS]: 25288122,
    [Position.CALLED_IN_PARTY_FACILITATOR]: 13464921,
    [Position.CALLED_IN_MOBILE_PARTY_FACILITATOR]: 25261978,
    [Position.CALLED_IN_AFTER_SCHOOL_PROGRAM_FACILITATOR]: 25261965,
    [Position.CALLED_IN_HOLIDAY_PROGRAM_FACILITATOR]: 13464944,
    [Position.CALLED_IN_PLAY_LAB_FACILITATOR]: 23638377,
    [Position.CALLED_IN_EVENTS_AND_ACTIVATIONS]: 25261991,
    [Position.CALLED_IN_INCURSIONS]: 25288124,
    [Position.SUNDAY_PARTY_FACILITATOR]: 25262618,
    [Position.SUNDAY_MOBILE_PARTY_FACILITATOR]: 25262619,
    [Position.SUNDAY_AFTER_SCHOOL_FACILITATOR]: 25262621,
    [Position.SUNDAY_HOLIDAY_PROGRAM_FACILITATOR]: 25262620,
    [Position.SUNDAY_PLAY_LAB_FACILITATOR]: 25262624,
    [Position.SUNDAY_EVENTS_AND_ACTIVATIONS]: 25262622,
    [Position.SUNDAY_INCURSIONS]: 25288126,
    [Position.SUNDAY_ON_CALL_PARTY_FACILITATOR]: 25262141,
    [Position.SUNDAY_ON_CALL_MOBILE_PARTY_FACILITATOR]: 25262128,
    [Position.SUNDAY_ON_CALL_AFTER_SCHOOL_PROGRAM_FACILITATOR]: 25262142,
    [Position.SUNDAY_ON_CALL_HOLIDAY_PROGRAM_FACILITATOR]: 25262136,
    [Position.SUNDAY_ON_CALL_PLAY_LAB_FACILITATOR]: 25262140,
    [Position.SUNDAY_ON_CALL_EVENTS_AND_ACTIVATIONS]: 25262132,
    [Position.SUNDAY_ON_CALL_INCURSIONS]: 25288131,
    [Position.SUNDAY_CALLED_IN_PARTY_FACILITATOR]: 25262145,
    [Position.SUNDAY_CALLED_IN_MOBILE_PARTY_FACILITATOR]: 25262146,
    [Position.SUNDAY_CALLED_IN_AFTER_SCHOOL_PROGRAM_FACILITATOR]: 25262149,
    [Position.SUNDAY_CALLED_IN_HOLIDAY_PROGRAM_FACILITATOR]: 25262147,
    [Position.SUNDAY_CALLED_IN_PLAY_LAB_FACILITATOR]: 25262148,
    [Position.SUNDAY_CALLED_IN_EVENTS_AND_ACTIVATIONS]: 25262144,
    [Position.SUNDAY_CALLED_IN_INCURSIONS]: 25288128,
    [Position.TRAINING]: 22914258,
    [Position.MISCELLANEOUS]: 6161155,
    [Position.SUNDAY_TRAINING]: 25267532,
    [Position.SUNDAY_MISCELLANEOUS]: 25267526,
    [Position.SUPERVISOR]: 25291330,
    [Position.SUNDAY_SUPERVISOR]: 25291331,
    [Position.ON_CALL]: 13464907,
}

const PositionMap: Record<number, Position> = Object.fromEntries(
    ObjectKeys(PositionToId).map((key) => [PositionToId[key], key])
)

const LocationToId: Record<Location, number> = {
    [Location.BALWYN]: 4809521,
    [Location.CHELTENHAM]: 11315826,
    [Location.ESSENDON]: 4895739,
    [Location.KINGSVILLE]: 22982854,
    [Location.MALVERN]: 4809537,
    [Location.MOBILE]: 5557282,
}

const LocationsMap: Record<number, Location> = Object.fromEntries(
    ObjectKeys(LocationToId).map((key) => [LocationToId[key], key])
)

type XeroTrackingActivity =
    | 'Events & Activations'
    | 'After School Programs'
    | 'Holiday Programs'
    | 'Incursions'
    | 'Mobile Parties'
    | 'No Activity'
    | 'Parties'
    | 'Play Lab'
    | 'Products'
    | 'Science Programs in-store'
    | 'Supervisor'
    | 'Training'

const PositionToActivityMap: Record<Position, XeroTrackingActivity> = {
    [Position.PARTY_FACILITATOR]: 'Parties',
    [Position.MOBILE_PARTY_FACILITATOR]: 'Mobile Parties',
    [Position.AFTER_SCHOOL_PROGRAM_FACILITATOR]: 'After School Programs',
    [Position.HOLIDAY_PROGRAM_FACILITATOR]: 'Holiday Programs',
    [Position.PLAY_LAB_FACILITATOR]: 'Play Lab',
    [Position.EVENTS_AND_ACTIVATIONS]: 'Events & Activations',
    [Position.INCURSIONS]: 'Incursions',
    [Position.ON_CALL_PARTY_FACILITATOR]: 'Parties',
    [Position.ON_CALL_MOBILE_PARTY_FACILITATOR]: 'Mobile Parties',
    [Position.ON_CALL_AFTER_SCHOOL_PROGRAM_FACILITATOR]: 'After School Programs',
    [Position.ON_CALL_HOLIDAY_PROGRAM_FACILITATOR]: 'Holiday Programs',
    [Position.ON_CALL_PLAY_LAB_FACILITATOR]: 'Play Lab',
    [Position.ON_CALL_EVENTS_AND_ACTIVATIONS]: 'Events & Activations',
    [Position.ON_CALL_INCURSIONS]: 'Incursions',
    [Position.CALLED_IN_PARTY_FACILITATOR]: 'Parties',
    [Position.CALLED_IN_MOBILE_PARTY_FACILITATOR]: 'Mobile Parties',
    [Position.CALLED_IN_AFTER_SCHOOL_PROGRAM_FACILITATOR]: 'After School Programs',
    [Position.CALLED_IN_HOLIDAY_PROGRAM_FACILITATOR]: 'Holiday Programs',
    [Position.CALLED_IN_PLAY_LAB_FACILITATOR]: 'Play Lab',
    [Position.CALLED_IN_EVENTS_AND_ACTIVATIONS]: 'Events & Activations',
    [Position.CALLED_IN_INCURSIONS]: 'Incursions',
    [Position.SUNDAY_PARTY_FACILITATOR]: 'Parties',
    [Position.SUNDAY_MOBILE_PARTY_FACILITATOR]: 'Mobile Parties',
    [Position.SUNDAY_AFTER_SCHOOL_FACILITATOR]: 'After School Programs',
    [Position.SUNDAY_HOLIDAY_PROGRAM_FACILITATOR]: 'Holiday Programs',
    [Position.SUNDAY_PLAY_LAB_FACILITATOR]: 'Play Lab',
    [Position.SUNDAY_EVENTS_AND_ACTIVATIONS]: 'Events & Activations',
    [Position.SUNDAY_INCURSIONS]: 'Incursions',
    [Position.SUNDAY_ON_CALL_PARTY_FACILITATOR]: 'Parties',
    [Position.SUNDAY_ON_CALL_MOBILE_PARTY_FACILITATOR]: 'Mobile Parties',
    [Position.SUNDAY_ON_CALL_AFTER_SCHOOL_PROGRAM_FACILITATOR]: 'After School Programs',
    [Position.SUNDAY_ON_CALL_HOLIDAY_PROGRAM_FACILITATOR]: 'Holiday Programs',
    [Position.SUNDAY_ON_CALL_PLAY_LAB_FACILITATOR]: 'Play Lab',
    [Position.SUNDAY_ON_CALL_EVENTS_AND_ACTIVATIONS]: 'Events & Activations',
    [Position.SUNDAY_ON_CALL_INCURSIONS]: 'Incursions',
    [Position.SUNDAY_CALLED_IN_PARTY_FACILITATOR]: 'Parties',
    [Position.SUNDAY_CALLED_IN_MOBILE_PARTY_FACILITATOR]: 'Mobile Parties',
    [Position.SUNDAY_CALLED_IN_AFTER_SCHOOL_PROGRAM_FACILITATOR]: 'After School Programs',
    [Position.SUNDAY_CALLED_IN_HOLIDAY_PROGRAM_FACILITATOR]: 'Holiday Programs',
    [Position.SUNDAY_CALLED_IN_PLAY_LAB_FACILITATOR]: 'Play Lab',
    [Position.SUNDAY_CALLED_IN_EVENTS_AND_ACTIVATIONS]: 'Events & Activations',
    [Position.SUNDAY_CALLED_IN_INCURSIONS]: 'Incursions',
    [Position.TRAINING]: 'Training',
    [Position.SUNDAY_TRAINING]: 'Training',
    [Position.SUPERVISOR]: 'Supervisor',
    [Position.SUNDAY_SUPERVISOR]: 'Supervisor',
    [Position.MISCELLANEOUS]: 'No Activity',
    [Position.SUNDAY_MISCELLANEOUS]: 'No Activity',
    [Position.ON_CALL]: 'No Activity',
}

type COGSCasualOrdinaryMonSat =
    | 'CGS COH - Mon to Sat - Balwyn'
    | 'CGS COH - Mon to Sat - Cheltenham'
    | 'CGS COH - Mon to Sat - Essendon'
    | 'CGS COH - Mon to Sat - Kingsville'
    | 'CGS COH - Mon to Sat - Malvern'
    | 'CGS COH - Mon to Sat - Head Office'

type NonCOGSCasualOrdinaryMonSat =
    | 'NON-CGS COH - Mon to Sat - Balwyn'
    | 'NON-CGS COH - Mon to Sat - Cheltenham'
    | 'NON-CGS COH - Mon to Sat - Essendon'
    | 'NON-CGS COH - Mon to Sat - Kingsville'
    | 'NON-CGS COH - Mon to Sat - Malvern'
    | 'NON-CGS COH - Mon to Sat - Head Office'

type COGSCasualOrdinarySunday =
    | 'CGS COH - Sunday - Balwyn'
    | 'CGS COH - Sunday - Cheltenham'
    | 'CGS COH - Sunday - Essendon'
    | 'CGS COH - Sunday - Kingsville'
    | 'CGS COH - Sunday - Malvern'
    | 'CGS COH - Sunday - Head Office'

type NonCOGSCasualOrdinarySunday =
    | 'NON-CGS COH - Sunday - Balwyn'
    | 'NON-CGS COH - Sunday - Cheltenham'
    | 'NON-CGS COH - Sunday - Essendon'
    | 'NON-CGS COH - Sunday - Kingsville'
    | 'NON-CGS COH - Sunday - Malvern'
    | 'NON-CGS COH - Sunday - Head Office'

type PTFTOrdinaryMonSat =
    | 'PT/FT Ordinary Hours - Mon to Sat - Balwyn'
    | 'PT/FT Ordinary Hours - Mon to Sat - Chelt'
    | 'PT/FT Ordinary Hours - Mon to Sat - Essendon'
    | 'PT/FT Ordinary Hours - Mon to Sat - Kingsville'
    | 'PT/FT Ordinary Hours - Mon to Sat - Malvern'
    | 'PT/FT Ordinary Hours - Mon to Sat - Head Office'

type PTFTOrdinaryHoursSunday =
    | 'PT/FT Ordinary Hours - Sunday - Balwyn'
    | 'PT/FT Ordinary Hours - Sunday - Chelt'
    | 'PT/FT Ordinary Hours - Sunday - Essendon'
    | 'PT/FT Ordinary Hours - Sunday - Kingsville'
    | 'PT/FT Ordinary Hours - Sunday - Malvern'
    | 'PT/FT Ordinary Hours - Sunday - Head Office'

type OnCallCasualOrdinaryMonSat =
    | 'ON CALL - Cas Ord Hrs - Mon to Sat - Balwyn'
    | 'ON CALL - Cas Ord Hrs - Mon to Sat - Chelt'
    | 'ON CALL - Cas Ord Hrs - Mon to Sat - Essen'
    | 'ON CALL - Cas Ord Hrs - Mon to Sat - Kingsville'
    | 'ON CALL - Cas Ord Hrs - Mon to Sat - Malv'
    | 'ON CALL - Cas Ord Hrs - Mon to Sat - Head Office'

type OnCallCasualOrdinarySunday =
    | 'ON CALL - Cas Ord Hrs - Sunday - Balwyn'
    | 'ON CALL - Cas Ord Hrs - Sunday - Chelt'
    | 'ON CALL - Cas Ord Hrs - Sunday - Essend'
    | 'ON CALL - Cas Ord Hrs - Sunday - Kingsville'
    | 'ON CALL - Cas Ord Hrs - Sunday - Malvern'
    | 'ON CALL - Cas Ord Hrs - Sunday - Head Office'

type CalledInCasualOrdinaryMonSat =
    | 'CALLEDIN - Cas Ord Hrs - Mon to Sat - Balwyn'
    | 'CALLEDIN - Cas Ord Hrs - Mon to Sat - Chelt'
    | 'CALLEDIN - Cas Ord Hrs - Mon to Sat - Essen'
    | 'CALLEDIN - Cas Ord Hrs - Mon to Sat - Kingsville'
    | 'CALLEDIN - Cas Ord Hrs - Mon to Sat - Malvern'
    | 'CALLEDIN - Cas Ord Hrs - Mon to Sat - Head Office'

type CalledInCasualOrdinarySunday =
    | 'CALLEDIN - Cas Ord Hrs - Sun - Balwyn'
    | 'CALLEDIN - Cas Ord Hrs - Sun - Chelt'
    | 'CALLEDIN - Cas Ord Hrs - Sun - Essend'
    | 'CALLEDIN - Cas Ord Hrs - Sun - Kingsville'
    | 'CALLEDIN - Cas Ord Hrs - Sun - Malvern'
    | 'CALLEDIN - Cas Ord Hrs - Sun - Head Office'

type COGSUnder18CasualOrdinaryHoursMonSat =
    | 'CGS 16&17yo COH - Mon to Sat - Balwyn'
    | 'CGS 16&17yo COH - Mon to Sat - Cheltenham'
    | 'CGS 16&17yo COH - Mon to Sat - Essendon'
    | 'CGS 16&17yo COH - Mon to Sat - Kingsville'
    | 'CGS 16&17yo COH - Mon to Sat - Malvern'
    | 'CGS 16&17yo COH - Mon to Sat - Head Office'

type NonCOGSUnder18CasualOrdinaryHoursMonSat =
    | 'NON-CGS 16&17yo COH - Mon to Sat - Balwyn'
    | 'NON-CGS 16&17yo COH - Mon to Sat - Cheltenham'
    | 'NON-CGS 16&17yo COH - Mon to Sat - Essendon'
    | 'NON-CGS 16&17yo COH - Mon to Sat - Kingsville'
    | 'NON-CGS 16&17yo COH - Mon to Sat - Malvern'
    | 'NON-CGS 16&17yo COH - Mon to Sat - Head Office'

type Under18OnCallOrdinaryHoursMonSat =
    | 'On call - 16&17yo Csl Or Hs - Mon to Sat - Balw'
    | 'On call - 16&17yo Csl Or Hs - Mon to Sat - Chelt'
    | 'On call - 16&17yo Csl Or Hs - Mon to Sat - Essen'
    | 'On call - 16&17yo Csl Or Hs - Mon to Sat - Kings'
    | 'On call - 16&17yo Csl Or Hs - Mon to Sat - Malvern'
    | 'On call - 16&17yo Csl Or Hs - Mon to Sat - HO'

type Under18CalledInOrdinaryHoursMonSat =
    | 'CALLEDIN - 16&17 Cas Ord Hrs - Mon to Sat - Balw'
    | 'CALLEDIN - 16&17 Cas Ord Hrs - Mon to Sat - Chelt'
    | 'CALLEDIN - 16&17 Cas Ord Hrs - Mon to Sat - Essen'
    | 'CALLEDIN - 16&17 Cas Ord Hrs - Mon to Sat - Kings'
    | 'CALLEDIN - 16&17 Cas Ord Hrs - Mon to Sat - Malv'
    | 'CALLEDIN - 16&17 COH - Mon to Sat - HO'

type COGSOvertimeFirstThreeHoursMonSat =
    | 'CGS OT - First 3 Hrs - Mon to Sat - Balwyn'
    | 'CGS OT - First 3 Hrs - Mon to Sat - Cheltenham'
    | 'CGS OT - First 3 Hrs - Mon to Sat - Essendon'
    | 'CGS OT - First 3 Hrs - Mon to Sat - Kingsville'
    | 'CGS OT - First 3 Hrs - Mon to Sat - Malvern'
    | 'CGS OT - First 3 Hrs - Mon to Sat - Head Office'

type NonCOGSOvertimeFirstThreeHoursMonSat =
    | 'NON-CGS OT - First 3 Hrs - Mon to Sat - Balwyn'
    | 'NON-CGS OT - First 3 Hrs - Mon to Sat - Cheltenham'
    | 'NON-CGS OT - First 3 Hrs - Mon to Sat - Essendon'
    | 'NON-CGS OT - First 3 Hrs - Mon to Sat - Kingsville'
    | 'NON-CGS OT - First 3 Hrs - Mon to Sat - Malvern'
    | 'NON-CGS OT - First 3 Hrs - Mon to Sat - HO'

type COGSOvertimeAfterThreeHours =
    | 'CGS OT - After 3 Hrs - Balwyn'
    | 'CGS OT - After 3 Hrs - Cheltenham'
    | 'CGS OT - After 3 Hrs - Essendon'
    | 'CGS OT - After 3 Hrs - Kingsville'
    | 'CGS OT - After 3 Hrs - Malvern'
    | 'CGS OT - After 3 Hrs - Head Office'

type NonCOGSOvertimeAfterThreeHours =
    | 'NON-CGS OT - After 3 Hrs - Balwyn'
    | 'NON-CGS OT - After 3 Hrs - Cheltenham'
    | 'NON-CGS OT - After 3 Hrs - Essendon'
    | 'NON-CGS OT - After 3 Hrs - Kingsville'
    | 'NON-CGS OT - After 3 Hrs - Malvern'
    | 'NON-CGS OT - After 3 Hrs - Head Office'

type COGSOvertimeFirstThreeHoursSunday =
    | 'CGS OT - First 3 Hrs - Sunday - Balwyn'
    | 'CGS OT - First 3 Hrs - Sunday - Cheltenham'
    | 'CGS OT - First 3 Hrs - Sunday - Essendon'
    | 'CGS OT - First 3 Hrs - Sunday - Kingsville'
    | 'CGS OT - First 3 Hrs - Sunday - Malvern'
    | 'CGS OT - First 3 Hrs - Sunday - Head Office'

type NonCOGSOvertimeFirstThreeHoursSunday =
    | 'NON-CGS OT - First 3 Hrs - Sunday - Balwyn'
    | 'NON-CGS OT - First 3 Hrs - Sunday - Cheltenham'
    | 'NON-CGS OT - First 3 Hrs - Sunday - Essendon'
    | 'NON-CGS OT - First 3 Hrs - Sunday - Kingsville'
    | 'NON-CGS OT - First 3 Hrs - Sunday - Malvern'
    | 'NON-CGS OT - First 3 Hrs - Sunday - Head Office'

type OnCallPayItem = OnCallCasualOrdinaryMonSat | OnCallCasualOrdinarySunday | Under18OnCallOrdinaryHoursMonSat

type CalledInPayItem = CalledInCasualOrdinaryMonSat | CalledInCasualOrdinarySunday | Under18CalledInOrdinaryHoursMonSat

type OvertimeFirstThreeHours =
    | COGSOvertimeFirstThreeHoursMonSat
    | NonCOGSOvertimeFirstThreeHoursMonSat
    | COGSOvertimeFirstThreeHoursSunday
    | NonCOGSOvertimeFirstThreeHoursSunday

type OvertimeAfterThreeHours = COGSOvertimeAfterThreeHours | NonCOGSOvertimeAfterThreeHours

type OvertimePayItem = OvertimeFirstThreeHours | OvertimeAfterThreeHours

type CasualOrdinaryMonSat = COGSCasualOrdinaryMonSat | NonCOGSCasualOrdinaryMonSat

type CasualOrdinarySunday = COGSCasualOrdinarySunday | NonCOGSCasualOrdinarySunday

type Under18CasualOrdinaryHoursMonSat = COGSUnder18CasualOrdinaryHoursMonSat | NonCOGSUnder18CasualOrdinaryHoursMonSat

type OrdinaryPayItem =
    | CasualOrdinaryMonSat
    | CasualOrdinarySunday
    | Under18CasualOrdinaryHoursMonSat
    | PTFTOrdinaryMonSat
    | PTFTOrdinaryHoursSunday

type PayItem = OrdinaryPayItem | OnCallPayItem | CalledInPayItem | OvertimePayItem
