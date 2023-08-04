import { DateTime, Duration, Interval } from 'luxon'
import { Rate, Timesheet as SlingTimesheet } from './types'

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

        // calculate pay item
        this.payItem = this.getPayItem(position, location)
    }

    private getPayItem(position: Position, location: Location): PayItem {
        if (this.overtime.firstThreeHours) return this._getOvertimeFirstThreeHours(location)
        if (this.overtime.afterThreeHours) return this._getOvertimeAfterThreeHours(location)
        if (position === Position.ON_CALL) return this._getOnCallPayItem(location)
        if (
            position === Position.CALLED_IN_PARTY_FACILITATOR ||
            position === Position.CALLED_IN_HOLIDAY_PROGRAM_FACILITATOR
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
    private isRateAbove18() {
        if (this.rate === 'not required') return false
        return this.rate * 1.25 >= 18
    }

    private _getOrdinaryPayItem(location: Location): OrdinaryPayItem {
        switch (location) {
            case Location.BALWYN:
                return this.isCasual
                    ? this._isYoungerThan18()
                        ? this._isMonSat()
                            ? this.isRateAbove18()
                                ? 'Casual Ordinary Hours - Mon to Sat - Balwyn'
                                : '16&17yo Casual Ordinary Hours - Mon to Sat - Balw'
                            : 'Casual Ordinary Hours - Sunday - Balwyn'
                        : this._isMonSat()
                        ? 'Casual Ordinary Hours - Mon to Sat - Balwyn'
                        : 'Casual Ordinary Hours - Sunday - Balwyn'
                    : this._isMonSat()
                    ? 'PT/FT Ordinary Hours - Mon to Sat - Balwyn'
                    : 'PT/FT Ordinary Hours - Sunday - Balwyn'

            case Location.CHELTENHAM:
                return this.isCasual
                    ? this._isYoungerThan18()
                        ? this._isMonSat()
                            ? this.isRateAbove18()
                                ? 'Casual Ordinary Hours - Mon to Sat - Chelt'
                                : '16&17yo Casual Ordinary Hours - Mon to Sat - Chelt'
                            : 'Casual Ordinary Hours - Sunday - Chelt'
                        : this._isMonSat()
                        ? 'Casual Ordinary Hours - Mon to Sat - Chelt'
                        : 'Casual Ordinary Hours - Sunday - Chelt'
                    : this._isMonSat()
                    ? 'PT/FT Ordinary Hours - Mon to Sat - Chelt'
                    : 'PT/FT Ordinary Hours - Sunday - Chelt'

            case Location.ESSENDON:
                return this.isCasual
                    ? this._isYoungerThan18()
                        ? this._isMonSat()
                            ? this.isRateAbove18()
                                ? 'Casual Ordinary Hours - Mon to Sat - Essendon'
                                : '16&17yo Casual Ordinary Hours - Mon to Sat - Esse'
                            : 'Casual Ordinary Hours - Sunday - Essendon'
                        : this._isMonSat()
                        ? 'Casual Ordinary Hours - Mon to Sat - Essendon'
                        : 'Casual Ordinary Hours - Sunday - Essendon'
                    : this._isMonSat()
                    ? 'PT/FT Ordinary Hours - Mon to Sat - Essendon'
                    : 'PT/FT Ordinary Hours - Sunday - Essendon'

            case Location.MALVERN:
                return this.isCasual
                    ? this._isYoungerThan18()
                        ? this._isMonSat()
                            ? this.isRateAbove18()
                                ? 'Casual Ordinary Hours - Mon to Sat - Malvern'
                                : '16&17yo Casual Ordinary Hours - Mon to Sat - Malv'
                            : 'Casual Ordinary Hours - Sunday - Malvern'
                        : this._isMonSat()
                        ? 'Casual Ordinary Hours - Mon to Sat - Malvern'
                        : 'Casual Ordinary Hours - Sunday - Malvern'
                    : this._isMonSat()
                    ? 'PT/FT Ordinary Hours - Mon to Sat - Malvern'
                    : 'PT/FT Ordinary Hours - Sunday - Malvern'
            case Location.MOBILE:
                return this.isCasual
                    ? this._isYoungerThan18()
                        ? this._isMonSat()
                            ? this.isRateAbove18()
                                ? 'Casual Ordinary Hours - Mon to Sat - Mobile'
                                : '16&17yo Casual Ordinary Hours - Mon to Sat - Mobil'
                            : 'Casual Ordinary Hours - Sunday - Mobile'
                        : this._isMonSat()
                        ? 'Casual Ordinary Hours - Mon to Sat - Mobile'
                        : 'Casual Ordinary Hours - Sunday - Mobile'
                    : this._isMonSat()
                    ? 'PT/FT Ordinary Hours - Mon to Sat - Mobile'
                    : 'PT/FT Ordinary Hours - Sunday - Mobile'
        }
    }

    private _getOnCallPayItem(location: Location): OnCallPayItem {
        switch (location) {
            case Location.BALWYN:
                return this._isYoungerThan18()
                    ? this._isMonSat()
                        ? this.isRateAbove18()
                            ? 'ON CALL - Cas Ord Hrs - Mon to Sat - Balwyn'
                            : 'On call - 16&17yo Csl Or Hs - Mon to Sat - Balw'
                        : 'ON CALL - Cas Ord Hrs - Sunday - Balwyn'
                    : this._isMonSat()
                    ? 'ON CALL - Cas Ord Hrs - Mon to Sat - Balwyn'
                    : 'ON CALL - Cas Ord Hrs - Sunday - Balwyn'
            case Location.CHELTENHAM:
                return this._isYoungerThan18()
                    ? this._isMonSat()
                        ? this.isRateAbove18()
                            ? 'ON CALL - Cas Ord Hrs - Mon to Sat - Chelt'
                            : 'On call - 16&17yo Csl Or Hs - Mon to Sat - Chelt'
                        : 'ON CALL - Cas Ord Hrs - Sunday - Chelt'
                    : this._isMonSat()
                    ? 'ON CALL - Cas Ord Hrs - Mon to Sat - Chelt'
                    : 'ON CALL - Cas Ord Hrs - Sunday - Chelt'
            case Location.ESSENDON:
                return this._isYoungerThan18()
                    ? this._isMonSat()
                        ? this.isRateAbove18()
                            ? 'ON CALL - Cas Ord Hrs - Mon to Sat - Essen'
                            : 'On call - 16&17yo Csl Or Hs - Mon to Sat - Essen'
                        : 'ON CALL - Cas Ord Hrs - Sunday - Essend'
                    : this._isMonSat()
                    ? 'ON CALL - Cas Ord Hrs - Mon to Sat - Essen'
                    : 'ON CALL - Cas Ord Hrs - Sunday - Essend'
            case Location.MALVERN:
                return this._isYoungerThan18()
                    ? this._isMonSat()
                        ? this.isRateAbove18()
                            ? 'ON CALL - Cas Ord Hrs - Mon to Sat - Malv'
                            : 'On call - 16&17yo Csl Or Hs - Mon to Sat - Malvern'
                        : 'ON CALL - Cas Ord Hrs - Sunday - Malvern'
                    : this._isMonSat()
                    ? 'ON CALL - Cas Ord Hrs - Mon to Sat - Malv'
                    : 'ON CALL - Cas Ord Hrs - Sunday - Malvern'
            case Location.MOBILE:
                return this._isYoungerThan18()
                    ? this._isMonSat()
                        ? this.isRateAbove18()
                            ? 'ON CALL - Cas Ord Hrs - Mon to Sat - Mobile'
                            : 'On call - 16&17yo Csl Or Hs - Mon to Sat - Mobile'
                        : 'ON CALL - Cas Ord Hrs - Sunday - Mobile'
                    : this._isMonSat()
                    ? 'ON CALL - Cas Ord Hrs - Mon to Sat - Mobile'
                    : 'ON CALL - Cas Ord Hrs - Sunday - Mobile'
        }
    }

    private _getCalledInPayItem(location: Location): CalledInPayItem {
        switch (location) {
            case Location.BALWYN:
                return this._isYoungerThan18()
                    ? this._isMonSat()
                        ? 'CALLEDIN - 16&17 Cas Ord Hrs - Mon to Sat - Balw'
                        : 'CALLEDIN - Cas Ord Hrs - Sun - Balwyn'
                    : this._isMonSat()
                    ? 'CALLEDIN - Cas Ord Hrs - Mon to Sat - Balwyn'
                    : 'CALLEDIN - Cas Ord Hrs - Sun - Balwyn'
            case Location.CHELTENHAM:
                return this._isYoungerThan18()
                    ? this._isMonSat()
                        ? 'CALLEDIN - 16&17 Cas Ord Hrs - Mon to Sat - Chelt'
                        : 'CALLEDIN - Cas Ord Hrs - Sun - Chelt'
                    : this._isMonSat()
                    ? 'CALLEDIN - Cas Ord Hrs - Mon to Sat - Chelt'
                    : 'CALLEDIN - Cas Ord Hrs - Sun - Chelt'
            case Location.ESSENDON:
                return this._isYoungerThan18()
                    ? this._isMonSat()
                        ? 'CALLEDIN - 16&17 Cas Ord Hrs - Mon to Sat - Essen'
                        : 'CALLEDIN - Cas Ord Hrs - Sun - Essend'
                    : this._isMonSat()
                    ? 'CALLEDIN - Cas Ord Hrs - Mon to Sat - Essen'
                    : 'CALLEDIN - Cas Ord Hrs - Sun - Essend'
            case Location.MALVERN:
                return this._isYoungerThan18()
                    ? this._isMonSat()
                        ? 'CALLEDIN - 16&17 Cas Ord Hrs - Mon to Sat - Malv'
                        : 'CALLEDIN - Cas Ord Hrs - Sun - Malvern'
                    : this._isMonSat()
                    ? 'CALLEDIN - Cas Ord Hrs - Mon to Sat - Malvern'
                    : 'CALLEDIN - Cas Ord Hrs - Sun - Malvern'
            case Location.MOBILE:
                return this._isYoungerThan18()
                    ? this._isMonSat()
                        ? 'CALLEDIN - 16&17 Cas Ord Hrs - Mon to Sat - Mobile'
                        : 'CALLEDIN - Cas Ord Hrs - Sun - Mobile'
                    : this._isMonSat()
                    ? 'CALLEDIN - Cas Ord Hrs - Mon to Sat - Mobile'
                    : 'CALLEDIN - Cas Ord Hrs - Sun - Mobile'
        }
    }

    private _getOvertimeFirstThreeHours(location: Location): OvertimeFirstThreeHours {
        switch (location) {
            case Location.BALWYN:
                return this._isMonSat()
                    ? 'Overtime Hours - First 3 Hrs - Mon to Sat - Balwyn'
                    : 'Overtime Hours - First 3 Hrs - Sunday - Balwyn'
            case Location.CHELTENHAM:
                return this._isMonSat()
                    ? 'Overtime Hours - First 3 Hrs - Mon to Sat - Chelt'
                    : 'Overtime Hours - First 3 Hrs - Sunday - Cheltenham'
            case Location.ESSENDON:
                return this._isMonSat()
                    ? 'Overtime Hours - First 3 Hrs - Mon to Sat - Essen'
                    : 'Overtime Hours - First 3 Hrs - Sunday - Essendon'
            case Location.MALVERN:
                return this._isMonSat()
                    ? 'Overtime Hours - First 3 Hrs - Mon to Sat - Malv'
                    : 'Overtime Hours - First 3 Hrs - Sunday - Malvern'
            case Location.MOBILE:
                return this._isMonSat()
                    ? 'Overtime Hours - First 3 Hrs - Mon to Sat - Mobile'
                    : 'Overtime Hours - First 3 Hrs - Sunday - Mobile'
        }
    }

    private _getOvertimeAfterThreeHours(location: Location): OvertimeAfterThreeHours {
        switch (location) {
            case Location.BALWYN:
                return 'Overtime Hours - After 3 Hrs - Balwyn'
            case Location.CHELTENHAM:
                return 'Overtime Hours - After 3 Hrs - Cheltenham'
            case Location.ESSENDON:
                return 'Overtime Hours - After 3 Hrs - Essendon'
            case Location.MALVERN:
                return 'Overtime Hours - After 3 Hrs - Malvern'
            case Location.MOBILE:
                return 'Overtime Hours - After 3 Hrs - Mobile'
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
    MALVERN = 'MALVERN',
    MOBILE = 'MOBILE',
}

export enum Position {
    PARTY_FACILITATOR = 'PARTY_FACILITATOR',
    SCIENCE_CLUB_FACILITATOR = 'SCIENCE_CLUB_FACILITATOR',
    HOLIDAY_PROGRAM_FACILITATOR = 'HOLIDAY_PROGRAM_FACILITATOR',
    MISCELLANEOUS = 'MISCELLANEOUS',
    ON_CALL = 'ON_CALL',
    CALLED_IN_PARTY_FACILITATOR = 'CALLED_IN_PARTY_FACILITATOR',
    CALLED_IN_HOLIDAY_PROGRAM_FACILITATOR = 'CALLED_IN_HOLIDAY_PROGRAM_FACILITATOR',
}

const PositionMap: { [key: number]: Position } = {
    4809533: Position.PARTY_FACILITATOR,
    5206290: Position.SCIENCE_CLUB_FACILITATOR,
    5557194: Position.HOLIDAY_PROGRAM_FACILITATOR,
    6161155: Position.MISCELLANEOUS,
    13464907: Position.ON_CALL,
    13464921: Position.CALLED_IN_PARTY_FACILITATOR,
    13464944: Position.CALLED_IN_HOLIDAY_PROGRAM_FACILITATOR,
} as const

const LocationsMap: { [key: number]: Location } = {
    4809521: Location.BALWYN,
    11315826: Location.CHELTENHAM,
    4895739: Location.ESSENDON,
    4809537: Location.MALVERN,
    5557282: Location.MOBILE,
} as const

type CasualOrdinaryMonSat =
    | 'Casual Ordinary Hours - Mon to Sat - Balwyn'
    | 'Casual Ordinary Hours - Mon to Sat - Chelt'
    | 'Casual Ordinary Hours - Mon to Sat - Essendon'
    | 'Casual Ordinary Hours - Mon to Sat - Malvern'
    | 'Casual Ordinary Hours - Mon to Sat - Mobile'

type CasualOrdinarySunday =
    | 'Casual Ordinary Hours - Sunday - Balwyn'
    | 'Casual Ordinary Hours - Sunday - Chelt'
    | 'Casual Ordinary Hours - Sunday - Essendon'
    | 'Casual Ordinary Hours - Sunday - Malvern'
    | 'Casual Ordinary Hours - Sunday - Mobile'

type PTFTOrdinaryMonSat =
    | 'PT/FT Ordinary Hours - Mon to Sat - Balwyn'
    | 'PT/FT Ordinary Hours - Mon to Sat - Chelt'
    | 'PT/FT Ordinary Hours - Mon to Sat - Essendon'
    | 'PT/FT Ordinary Hours - Mon to Sat - Malvern'
    | 'PT/FT Ordinary Hours - Mon to Sat - Mobile'

type PTFTOrdinaryHoursSunday =
    | 'PT/FT Ordinary Hours - Sunday - Balwyn'
    | 'PT/FT Ordinary Hours - Sunday - Chelt'
    | 'PT/FT Ordinary Hours - Sunday - Essendon'
    | 'PT/FT Ordinary Hours - Sunday - Malvern'
    | 'PT/FT Ordinary Hours - Sunday - Mobile'

type OnCallCasualOrdinaryMonSat =
    | 'ON CALL - Cas Ord Hrs - Mon to Sat - Balwyn'
    | 'ON CALL - Cas Ord Hrs - Mon to Sat - Chelt'
    | 'ON CALL - Cas Ord Hrs - Mon to Sat - Essen'
    | 'ON CALL - Cas Ord Hrs - Mon to Sat - Malv'
    | 'ON CALL - Cas Ord Hrs - Mon to Sat - Mobile'

type OnCallCasualOrdinarySunday =
    | 'ON CALL - Cas Ord Hrs - Sunday - Balwyn'
    | 'ON CALL - Cas Ord Hrs - Sunday - Chelt'
    | 'ON CALL - Cas Ord Hrs - Sunday - Essend'
    | 'ON CALL - Cas Ord Hrs - Sunday - Malvern'
    | 'ON CALL - Cas Ord Hrs - Sunday - Mobile'

type CalledInCasualOrdinaryMonSat =
    | 'CALLEDIN - Cas Ord Hrs - Mon to Sat - Balwyn'
    | 'CALLEDIN - Cas Ord Hrs - Mon to Sat - Chelt'
    | 'CALLEDIN - Cas Ord Hrs - Mon to Sat - Essen'
    | 'CALLEDIN - Cas Ord Hrs - Mon to Sat - Malvern'
    | 'CALLEDIN - Cas Ord Hrs - Mon to Sat - Mobile'

type CalledInCasualOrdinarySunday =
    | 'CALLEDIN - Cas Ord Hrs - Sun - Balwyn'
    | 'CALLEDIN - Cas Ord Hrs - Sun - Chelt'
    | 'CALLEDIN - Cas Ord Hrs - Sun - Essend'
    | 'CALLEDIN - Cas Ord Hrs - Sun - Malvern'
    | 'CALLEDIN - Cas Ord Hrs - Sun - Mobile'

type Under18CasualOrdinaryHoursMonSat =
    | '16&17yo Casual Ordinary Hours - Mon to Sat - Balw'
    | '16&17yo Casual Ordinary Hours - Mon to Sat - Chelt'
    | '16&17yo Casual Ordinary Hours - Mon to Sat - Esse'
    | '16&17yo Casual Ordinary Hours - Mon to Sat - Malv'
    | '16&17yo Casual Ordinary Hours - Mon to Sat - Mobil'

type Under18OnCallOrdinaryHoursMonSat =
    | 'On call - 16&17yo Csl Or Hs - Mon to Sat - Balw'
    | 'On call - 16&17yo Csl Or Hs - Mon to Sat - Chelt'
    | 'On call - 16&17yo Csl Or Hs - Mon to Sat - Essen'
    | 'On call - 16&17yo Csl Or Hs - Mon to Sat - Malvern'
    | 'On call - 16&17yo Csl Or Hs - Mon to Sat - Mobile'

type Under18CalledInOrdinaryHoursMonSat =
    | 'CALLEDIN - 16&17 Cas Ord Hrs - Mon to Sat - Balw'
    | 'CALLEDIN - 16&17 Cas Ord Hrs - Mon to Sat - Chelt'
    | 'CALLEDIN - 16&17 Cas Ord Hrs - Mon to Sat - Essen'
    | 'CALLEDIN - 16&17 Cas Ord Hrs - Mon to Sat - Malv'
    | 'CALLEDIN - 16&17 Cas Ord Hrs - Mon to Sat - Mobile'

type OvertimeFirstThreeHoursMonSat =
    | 'Overtime Hours - First 3 Hrs - Mon to Sat - Balwyn'
    | 'Overtime Hours - First 3 Hrs - Mon to Sat - Chelt'
    | 'Overtime Hours - First 3 Hrs - Mon to Sat - Essen'
    | 'Overtime Hours - First 3 Hrs - Mon to Sat - Malv'
    | 'Overtime Hours - First 3 Hrs - Mon to Sat - Mobile'

type OvertimeAfterThreeHours =
    | 'Overtime Hours - After 3 Hrs - Balwyn'
    | 'Overtime Hours - After 3 Hrs - Cheltenham'
    | 'Overtime Hours - After 3 Hrs - Essendon'
    | 'Overtime Hours - After 3 Hrs - Malvern'
    | 'Overtime Hours - After 3 Hrs - Mobile'

type OvertimeFirstThreeHoursSunday =
    | 'Overtime Hours - First 3 Hrs - Sunday - Balwyn'
    | 'Overtime Hours - First 3 Hrs - Sunday - Cheltenham'
    | 'Overtime Hours - First 3 Hrs - Sunday - Essendon'
    | 'Overtime Hours - First 3 Hrs - Sunday - Malvern'
    | 'Overtime Hours - First 3 Hrs - Sunday - Mobile'

type OnCallPayItem = OnCallCasualOrdinaryMonSat | OnCallCasualOrdinarySunday | Under18OnCallOrdinaryHoursMonSat

type CalledInPayItem = CalledInCasualOrdinaryMonSat | CalledInCasualOrdinarySunday | Under18CalledInOrdinaryHoursMonSat

type OvertimeFirstThreeHours = OvertimeFirstThreeHoursMonSat | OvertimeFirstThreeHoursSunday

type OvertimePayItem = OvertimeFirstThreeHours | OvertimeAfterThreeHours

type OrdinaryPayItem =
    | CasualOrdinaryMonSat
    | CasualOrdinarySunday
    | Under18CasualOrdinaryHoursMonSat
    | PTFTOrdinaryMonSat
    | PTFTOrdinaryHoursSunday

type PayItem = OrdinaryPayItem | OnCallPayItem | CalledInPayItem | OvertimePayItem
