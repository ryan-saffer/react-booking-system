import { DateTime, Duration, Interval } from 'luxon'
import { Timesheet as SlingTimesheet } from './types'

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
    while (start < end) {
        if (Interval.fromDateTimes(start, end).length('days') <= 7) {
            output.push(Interval.fromDateTimes(start, end))
        } else {
            output.push(Interval.after(start, Duration.fromObject({ days: 7 })))
        }
        start = start.plus({ days: 7 })
    }
    return output
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
export function createTimesheetRows(
    firstName: string,
    lastName: string,
    dob: DateTime,
    isCasual: boolean,
    usersTimesheets: SlingTimesheet[],
    timezone: string
): TimesheetRow[] {
    const output: TimesheetRow[] = []

    // keep track of hours worked this week
    let totalHours = 0

    usersTimesheets.map((timesheet) => {
        const position = PositionMap[timesheet.position.id]
        const location = LocationsMap[timesheet.location.id]
        const start = DateTime.fromISO(timesheet.dtstart, { zone: timezone })
        const end = DateTime.fromISO(timesheet.dtend, { zone: timezone })
        const shiftLengthInHours = end.diff(start, 'hours').hours

        // calculate if this shift puts employee into overtime for the week
        const hoursUntilOvertime = 30 - totalHours

        if (hoursUntilOvertime > 0) {
            // overtime not yet reached
            const overtimeHours = shiftLengthInHours - hoursUntilOvertime
            if (overtimeHours <= 0) {
                // entire shift fits before reaching overtime
                output.push(
                    new TimesheetRow({
                        firstName,
                        lastName,
                        dob,
                        date: start,
                        isCasual,
                        position,
                        location,
                        hours: shiftLengthInHours,
                        overtime: { firstThreeHours: false, afterThreeHours: false },
                    })
                )
            } else {
                // only part of the shift fits before reaching overtime.
                // add until overtime, and then add the rest as overtime
                output.push(
                    new TimesheetRow({
                        firstName,
                        lastName,
                        dob,
                        isCasual,
                        date: start,
                        position,
                        location,
                        hours: hoursUntilOvertime,
                        overtime: { firstThreeHours: false, afterThreeHours: false },
                    })
                )

                createOvertimeTimesheetRows(
                    overtimeHours,
                    30,
                    firstName,
                    lastName,
                    dob,
                    isCasual,
                    start,
                    position,
                    location
                ).map((row) => output.push(row))
            }
        } else {
            // already in overtime
            createOvertimeTimesheetRows(
                shiftLengthInHours,
                totalHours,
                firstName,
                lastName,
                dob,
                isCasual,
                start,
                position,
                location
            ).map((row) => output.push(row))
        }
        totalHours += shiftLengthInHours
    })
    return output
}

function createOvertimeTimesheetRows(
    hours: number,
    totalHours: number,
    firstName: string,
    lastName: string,
    dob: DateTime,
    isCasual: boolean,
    date: DateTime,
    position: Position,
    location: Location
) {
    const output: TimesheetRow[] = []
    // calculate if the hours puts employee into after three hours of overtime
    const hoursUntilAfterThreeHours = 33 - totalHours

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
                    isCasual,
                    date,
                    position,
                    location,
                    hours,
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
                    isCasual,
                    date,
                    position,
                    location,
                    hours: hoursUntilAfterThreeHours,
                    overtime: { firstThreeHours: true, afterThreeHours: false },
                })
            )
            output.push(
                new TimesheetRow({
                    firstName,
                    lastName,
                    dob,
                    isCasual,
                    date,
                    position,
                    location,
                    hours: afterThreeHours,
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
                isCasual,
                date,
                position,
                location,
                hours,
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
    payItem: PayItem
    date: DateTime
    isCasual: boolean
    hours: number
    overtime: Overtime

    constructor({
        firstName,
        lastName,
        dob,
        date,
        position,
        location,
        isCasual,
        hours,
        overtime,
    }: {
        firstName: string
        lastName: string
        dob: DateTime
        date: DateTime
        position: Position
        location: Location
        isCasual: boolean
        hours: number
        overtime: Overtime
    }) {
        this.firstName = firstName
        this.lastname = lastName
        this.dob = dob
        this.date = date
        this.isCasual = isCasual
        this.hours = hours
        this.overtime = overtime

        // calculate pay item
        this.payItem = this.getPayItem(position, location)
    }

    private getPayItem(position: Position, location: Location): PayItem {
        // TODO - AGE CALC
        // TODO - PUBLIC HOLIDAYS
        // TODO - OVERTIME
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
        return DateTime.now().diff(this.dob, 'years').years < 18
    }

    private _getOrdinaryPayItem(location: Location): OrdinaryPayItem {
        switch (location) {
            case Location.BALWYN:
                return this.isCasual
                    ? this._isYoungerThan18()
                        ? this._isMonSat()
                            ? '16&17yo Casual Ordinary Hours - Mon to Sat - Balw'
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
                            ? '16&17yo Casual Ordinary Hours - Mon to Sat - Chelt'
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
                            ? '16&17yo Casual Ordinary Hours - Mon to Sat - Esse'
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
                            ? '16&17yo Casual Ordinary Hours - Mon to Sat - Malv'
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
                            ? '16&17yo Casual Ordinary Hours - Mon to Sat - Mobil'
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
                        ? 'TODO - On call - 16&17yo Csl Or Hs - Mon to Sat - Balwyn'
                        : 'TODO - On call - 16&17yo Csl Or Hs - Sunday - Balwyn'
                    : this._isMonSat()
                    ? 'ON CALL - Cas Ord Hrs - Mon to Sat - Balwyn'
                    : 'ON CALL - Cas Ord Hrs - Sunday - Balwyn'
            case Location.CHELTENHAM:
                return this._isYoungerThan18()
                    ? this._isMonSat()
                        ? 'On call - 16&17yo Csl Or Hs - Mon to Sat - Chelt'
                        : 'On call - 16&17yo Csl Or Hs - Sunday - Chelt'
                    : this._isMonSat()
                    ? 'ON CALL - Cas Ord Hrs - Mon to Sat - Chelt'
                    : 'ON CALL - Cas Ord Hrs - Sunday - Chelt'
            case Location.ESSENDON:
                return this._isYoungerThan18()
                    ? this._isMonSat()
                        ? 'TODO - On call - 16&17yo Csl Or Hs - Mon to Sat - Essen'
                        : 'TODO - On call - 16&17yo Csl Or Hs - Sunday - Essen'
                    : this._isMonSat()
                    ? 'ON CALL - Cas Ord Hrs - Mon to Sat - Essen'
                    : 'ON CALL - Cas Ord Hrs - Sunday - Essend'
            case Location.MALVERN:
                return this._isYoungerThan18()
                    ? this._isMonSat()
                        ? 'TODO - On call - 16&17yo Csl Or Hs - Mon to Sat - Malvern'
                        : 'TODO - On call - 16&17yo Csl Or Hs - Sunday - Malvern'
                    : this._isMonSat()
                    ? 'ON CALL - Cas Ord Hrs - Mon to Sat - Malv'
                    : 'ON CALL - Cas Ord Hrs - Sunday - Malvern'
            case Location.MOBILE:
                return this._isYoungerThan18()
                    ? this._isMonSat()
                        ? 'TODO - On call - 16&17yo Csl Or Hs - Mon to Sat - Mobile'
                        : 'TODO - On call - 16&17yo Csl Or Hs - Sunday - Mobile'
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
                        ? 'TODO - CALLEDIN - 16&17 Cas Ord Hrs - Mon to Sat - Balwyn'
                        : 'TODO - CALLED IN - 16&17 Cas Ord Hrs - Sunday - Balwyn'
                    : this._isMonSat()
                    ? 'CALLEDIN - Cas Ord Hrs - Mon to Sat - Balwyn'
                    : 'CALLEDIN - Cas Ord Hrs - Sun - Balwyn'
            case Location.CHELTENHAM:
                return this._isYoungerThan18()
                    ? this._isMonSat()
                        ? 'TODO - CALLEDIN - 16&17 Cas Ord Hrs - Mon to Sat - Chelt'
                        : 'TODO - CALLED IN - 16&17 Cas Ord Hrs - Sunday - Chelt'
                    : this._isMonSat()
                    ? 'CALLEDIN - Cas Ord Hrs - Mon to Sat - Chelt'
                    : 'CALLEDIN - Cas Ord Hrs - Sun - Chelt'
            case Location.ESSENDON:
                return this._isYoungerThan18()
                    ? this._isMonSat()
                        ? 'CALLEDIN - 16&17 Cas Ord Hrs - Mon to Sat - Essen'
                        : 'TODO - CALLED IN - 16&17 Cas Ord Hrs - Sunday - Essen'
                    : this._isMonSat()
                    ? 'CALLEDIN - Cas Ord Hrs - Mon to Sat - Essen'
                    : 'CALLEDIN - Cas Ord Hrs - Sun - Essend'
            case Location.MALVERN:
                return this._isYoungerThan18()
                    ? this._isMonSat()
                        ? 'TODO - CALLEDIN - 16&17 Cas Ord Hrs - Mon to Sat - Malvern'
                        : 'TODO - CALLED IN - 16&17 Cas Ord Hrs - Sunday - Malvern'
                    : this._isMonSat()
                    ? 'CALLEDIN - Cas Ord Hrs - Mon to Sat - Malvern'
                    : 'CALLEDIN - Cas Ord Hrs - Sun - Malvern'
            case Location.MOBILE:
                return this._isYoungerThan18()
                    ? this._isMonSat()
                        ? 'TODO - CALLEDIN - 16&17 Cas Ord Hrs - Mon to Sat - Mobile'
                        : 'TODO - CALLED IN - 16&17 Cas Ord Hrs - Sunday - Mobile'
                    : this._isMonSat()
                    ? 'CALLEDIN - Cas Ord Hrs - Mon to Sat - Mobile'
                    : 'CALLEDIN - Cas Ord Hrs - Sun - Mobile'
        }
    }

    private _getOvertimeFirstThreeHours(location: Location): OvertimeFirstThreeHours {
        switch (location) {
            case Location.BALWYN:
                return 'TODO - OVERTIME - FIRST THREE HOURS - BALWYN'
            case Location.CHELTENHAM:
                return 'TODO - OVERTIME - FIRST THREE HOURS - CHELTENHAM'
            case Location.ESSENDON:
                return 'TODO - OVERTIME - FIRST THREE HOURS - ESSENDON'
            case Location.MALVERN:
                return 'TODO - OVERTIME - FIRST THREE HOURS - MALVERN'
            case Location.MOBILE:
                return 'TODO - OVERTIME - FIRST THREE HOURS - MOBILE'
        }
    }

    private _getOvertimeAfterThreeHours(location: Location): OvertimeAfterThreeHours {
        switch (location) {
            case Location.BALWYN:
                return 'TODO - OVERTIME - AFTER THREE HOURS - BALWYN'
            case Location.CHELTENHAM:
                return 'TODO - OVERTIME - AFTER THREE HOURS - CHELTENHAM'
            case Location.ESSENDON:
                return 'TODO - OVERTIME - AFTER THREE HOURS - ESSENDON'
            case Location.MALVERN:
                return 'TODO - OVERTIME - AFTER THREE HOURS - MALVERN'
            case Location.MOBILE:
                return 'TODO - OVERTIME - AFTER THREE HOURS - MOBILE'
        }
    }
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
    | 'TODO - On call - 16&17yo Csl Or Hs - Mon to Sat - Balwyn'
    | 'On call - 16&17yo Csl Or Hs - Mon to Sat - Chelt'
    | 'TODO - On call - 16&17yo Csl Or Hs - Mon to Sat - Essen'
    | 'TODO - On call - 16&17yo Csl Or Hs - Mon to Sat - Malvern'
    | 'TODO - On call - 16&17yo Csl Or Hs - Mon to Sat - Mobile'

type Under18OnCallOrdinaryHoursSunday =
    | 'TODO - On call - 16&17yo Csl Or Hs - Sunday - Balwyn'
    | 'On call - 16&17yo Csl Or Hs - Sunday - Chelt'
    | 'TODO - On call - 16&17yo Csl Or Hs - Sunday - Essen'
    | 'TODO - On call - 16&17yo Csl Or Hs - Sunday - Malvern'
    | 'TODO - On call - 16&17yo Csl Or Hs - Sunday - Mobile'

type Under18CalledInOrdinaryHoursMonSat =
    | 'TODO - CALLEDIN - 16&17 Cas Ord Hrs - Mon to Sat - Balwyn'
    | 'TODO - CALLEDIN - 16&17 Cas Ord Hrs - Mon to Sat - Chelt'
    | 'CALLEDIN - 16&17 Cas Ord Hrs - Mon to Sat - Essen'
    | 'TODO - CALLEDIN - 16&17 Cas Ord Hrs - Mon to Sat - Malvern'
    | 'TODO - CALLEDIN - 16&17 Cas Ord Hrs - Mon to Sat - Mobile'

type Under18CalledInOrdinaryHoursSunday =
    | 'TODO - CALLED IN - 16&17 Cas Ord Hrs - Sunday - Balwyn'
    | 'TODO - CALLED IN - 16&17 Cas Ord Hrs - Sunday - Chelt'
    | 'TODO - CALLED IN - 16&17 Cas Ord Hrs - Sunday - Essen'
    | 'TODO - CALLED IN - 16&17 Cas Ord Hrs - Sunday - Malvern'
    | 'TODO - CALLED IN - 16&17 Cas Ord Hrs - Sunday - Mobile'

type OvertimeFirstThreeHours =
    | 'TODO - OVERTIME - FIRST THREE HOURS - BALWYN'
    | 'TODO - OVERTIME - FIRST THREE HOURS - CHELTENHAM'
    | 'TODO - OVERTIME - FIRST THREE HOURS - ESSENDON'
    | 'TODO - OVERTIME - FIRST THREE HOURS - MALVERN'
    | 'TODO - OVERTIME - FIRST THREE HOURS - MOBILE'

type OvertimeAfterThreeHours =
    | 'TODO - OVERTIME - AFTER THREE HOURS - BALWYN'
    | 'TODO - OVERTIME - AFTER THREE HOURS - CHELTENHAM'
    | 'TODO - OVERTIME - AFTER THREE HOURS - ESSENDON'
    | 'TODO - OVERTIME - AFTER THREE HOURS - MALVERN'
    | 'TODO - OVERTIME - AFTER THREE HOURS - MOBILE'

type OnCallPayItem =
    | OnCallCasualOrdinaryMonSat
    | OnCallCasualOrdinarySunday
    | Under18OnCallOrdinaryHoursMonSat
    | Under18OnCallOrdinaryHoursSunday

type CalledInPayItem =
    | CalledInCasualOrdinaryMonSat
    | CalledInCasualOrdinarySunday
    | Under18CalledInOrdinaryHoursMonSat
    | Under18CalledInOrdinaryHoursSunday

type OvertimePayItem = OvertimeFirstThreeHours | OvertimeAfterThreeHours

type OrdinaryPayItem =
    | CasualOrdinaryMonSat
    | CasualOrdinarySunday
    | Under18CasualOrdinaryHoursMonSat
    | PTFTOrdinaryMonSat
    | PTFTOrdinaryHoursSunday

type PayItem = OrdinaryPayItem | OnCallPayItem | CalledInPayItem | OvertimePayItem
