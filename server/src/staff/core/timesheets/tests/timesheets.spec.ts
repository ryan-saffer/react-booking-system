import { strictEqual } from 'assert'

import { DateTime } from 'luxon'
import { Employee } from 'xero-node/dist/gen/model/payroll-au/employee'

import { Timesheet } from '../timesheets.types'
import { Location, Position, TimesheetRow, createTimesheetRows, getWeeks, hasBirthdayDuring } from '../timesheets.utils'

const olderThan18 = DateTime.fromObject({ year: 2000, day: 30, month: 5 })
const youngerThan18 = DateTime.fromObject({ year: 2015, day: 1, month: 1 })

const AUS_DATE_FORMAT = 'dd/LL/yyyy'

describe('Timesheet suite', () => {
    describe('breaking down range to weeks', () => {
        it('should be single range for 7 days', () => {
            // given
            const start = DateTime.fromObject({ day: 5, month: 6, year: 2023 }).setZone('Australia/Melbourne')
            const end = DateTime.fromObject({ day: 11, month: 6, year: 2023 }).setZone('Australia/Melbourne')

            // when
            const result = getWeeks(start, end)

            // then
            strictEqual(result.length, 1)
            strictEqual(result[0].start.toFormat(AUS_DATE_FORMAT), '05/06/2023')
            strictEqual(result[0].end.toFormat(AUS_DATE_FORMAT), '11/06/2023')
        })

        it('should be two ranges for 8 days', () => {
            // given
            const start = DateTime.fromObject({ day: 5, month: 6, year: 2023 })
            const end = DateTime.fromObject({ day: 12, month: 6, year: 2023 })

            // when
            const result = getWeeks(start, end)

            // then
            strictEqual(result.length, 2)
            strictEqual(result[0].start.toFormat(AUS_DATE_FORMAT), '05/06/2023')
            strictEqual(result[0].end.toFormat(AUS_DATE_FORMAT), '11/06/2023')
            strictEqual(result[1].start.toFormat(AUS_DATE_FORMAT), '12/06/2023')
            strictEqual(result[1].end.toFormat(AUS_DATE_FORMAT), '12/06/2023')
        })

        it('should be two ranges for 14 days', () => {
            // given
            const start = DateTime.fromObject({ day: 5, month: 6, year: 2023 })
            const end = DateTime.fromObject({ day: 18, month: 6, year: 2023 })

            // when
            const result = getWeeks(start, end)

            // then
            strictEqual(result.length, 2)
            strictEqual(result[0].start.toFormat(AUS_DATE_FORMAT), '05/06/2023')
            strictEqual(result[0].end.toFormat(AUS_DATE_FORMAT), '11/06/2023')
            strictEqual(result[1].start.toFormat(AUS_DATE_FORMAT), '12/06/2023')
            strictEqual(result[1].end.toFormat(AUS_DATE_FORMAT), '18/06/2023')
        })

        it('should be three ranges for 15 days', () => {
            // given
            const start = DateTime.fromObject({ day: 5, month: 6, year: 2023 })
            const end = DateTime.fromObject({ day: 19, month: 6, year: 2023 })

            // when
            const result = getWeeks(start, end)

            // then
            strictEqual(result.length, 3)
            strictEqual(result[0].start.toFormat(AUS_DATE_FORMAT), '05/06/2023')
            strictEqual(result[0].end.toFormat(AUS_DATE_FORMAT), '11/06/2023')
            strictEqual(result[1].start.toFormat(AUS_DATE_FORMAT), '12/06/2023')
            strictEqual(result[1].end.toFormat(AUS_DATE_FORMAT), '18/06/2023')
            strictEqual(result[2].start.toFormat(AUS_DATE_FORMAT), '19/06/2023')
            strictEqual(result[2].end.toFormat(AUS_DATE_FORMAT), '19/06/2023')
        })
    })

    describe('Pay Item mappings', () => {
        it('should map on call for all locations mon-sat - over 18', () => {
            // balwyn
            let row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.ON_CALL,
                location: Location.BALWYN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'ON CALL - Cas Ord Hrs - Mon to Sat - Balwyn')

            // cheltenham
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.ON_CALL,
                location: Location.CHELTENHAM,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'ON CALL - Cas Ord Hrs - Mon to Sat - Chelt')

            // essendon
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.ON_CALL,
                location: Location.ESSENDON,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'ON CALL - Cas Ord Hrs - Mon to Sat - Essen')

            // malvern
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.ON_CALL,
                location: Location.MALVERN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'ON CALL - Cas Ord Hrs - Mon to Sat - Malv')

            // mobile
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.ON_CALL,
                location: Location.MOBILE,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'ON CALL - Cas Ord Hrs - Mon to Sat - Mobile')
        })

        it('should map on call for all locations mon-sat - younger than 18', () => {
            // balwyn
            let row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.ON_CALL,
                location: Location.BALWYN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'On call - 16&17yo Csl Or Hs - Mon to Sat - Balw')

            // cheltenham
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.ON_CALL,
                location: Location.CHELTENHAM,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'On call - 16&17yo Csl Or Hs - Mon to Sat - Chelt')

            // essendon
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.ON_CALL,
                location: Location.ESSENDON,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'On call - 16&17yo Csl Or Hs - Mon to Sat - Essen')

            // malvern
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.ON_CALL,
                location: Location.MALVERN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'On call - 16&17yo Csl Or Hs - Mon to Sat - Malvern')

            // mobile
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.ON_CALL,
                location: Location.MOBILE,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'On call - 16&17yo Csl Or Hs - Mon to Sat - Mobile')
        })

        it('should map on call for all locations on sunday - over 18', () => {
            // balwyn
            let row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.ON_CALL,
                location: Location.BALWYN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'ON CALL - Cas Ord Hrs - Sunday - Balwyn')

            // cheltenham
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.ON_CALL,
                location: Location.CHELTENHAM,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'ON CALL - Cas Ord Hrs - Sunday - Chelt')

            // essendon
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.ON_CALL,
                location: Location.ESSENDON,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'ON CALL - Cas Ord Hrs - Sunday - Essend')

            // malvern
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.ON_CALL,
                location: Location.MALVERN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'ON CALL - Cas Ord Hrs - Sunday - Malvern')

            // mobile
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.ON_CALL,
                location: Location.MOBILE,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'ON CALL - Cas Ord Hrs - Sunday - Mobile')
        })

        it('should map on call for all locations on sunday - under 18', () => {
            // balwyn
            let row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.ON_CALL,
                location: Location.BALWYN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'ON CALL - Cas Ord Hrs - Sunday - Balwyn')

            // cheltenham
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.ON_CALL,
                location: Location.CHELTENHAM,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'ON CALL - Cas Ord Hrs - Sunday - Chelt')

            // essendon
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.ON_CALL,
                location: Location.ESSENDON,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'ON CALL - Cas Ord Hrs - Sunday - Essend')

            // malvern
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.ON_CALL,
                location: Location.MALVERN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'ON CALL - Cas Ord Hrs - Sunday - Malvern')

            // mobile
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.ON_CALL,
                location: Location.MOBILE,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'ON CALL - Cas Ord Hrs - Sunday - Mobile')
        })

        it('should map called in party facilitator for all locations mon-sat - over 18', () => {
            // balwyn
            let row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 2, month: 5, year: 2023 }), // tuesday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.CALLED_IN_PARTY_FACILITATOR,
                location: Location.BALWYN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - Cas Ord Hrs - Mon to Sat - Balwyn')

            // cheltenham
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 2, month: 5, year: 2023 }), // tuesday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.CALLED_IN_PARTY_FACILITATOR,
                location: Location.CHELTENHAM,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - Cas Ord Hrs - Mon to Sat - Chelt')

            // essendon
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 2, month: 5, year: 2023 }), // tuesday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.CALLED_IN_PARTY_FACILITATOR,
                location: Location.ESSENDON,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - Cas Ord Hrs - Mon to Sat - Essen')

            // malvern
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 2, month: 5, year: 2023 }), // tuesday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.CALLED_IN_PARTY_FACILITATOR,
                location: Location.MALVERN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - Cas Ord Hrs - Mon to Sat - Malvern')

            // mobile
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 2, month: 5, year: 2023 }), // tuesday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.CALLED_IN_PARTY_FACILITATOR,
                location: Location.MOBILE,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - Cas Ord Hrs - Mon to Sat - Mobile')
        })

        it('should map called in party facilitator for all locations mon-sat - under 18', () => {
            // balwyn
            let row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 2, month: 5, year: 2023 }), // tuesday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.CALLED_IN_PARTY_FACILITATOR,
                location: Location.BALWYN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - 16&17 Cas Ord Hrs - Mon to Sat - Balw')

            // cheltenham
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 2, month: 5, year: 2023 }), // tuesday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.CALLED_IN_PARTY_FACILITATOR,
                location: Location.CHELTENHAM,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - 16&17 Cas Ord Hrs - Mon to Sat - Chelt')

            // essendon
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 2, month: 5, year: 2023 }), // tuesday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.CALLED_IN_PARTY_FACILITATOR,
                location: Location.ESSENDON,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - 16&17 Cas Ord Hrs - Mon to Sat - Essen')

            // malvern
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 2, month: 5, year: 2023 }), // tuesday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.CALLED_IN_PARTY_FACILITATOR,
                location: Location.MALVERN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - 16&17 Cas Ord Hrs - Mon to Sat - Malv')

            // mobile
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 2, month: 5, year: 2023 }), // tuesday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.CALLED_IN_PARTY_FACILITATOR,
                location: Location.MOBILE,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - 16&17 Cas Ord Hrs - Mon to Sat - Mobile')
        })

        it('should map called in holiday program facilitator for all locations mon-sat - over 18', () => {
            // balwyn
            let row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 2, month: 5, year: 2023 }), // tuesday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.CALLED_IN_HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.BALWYN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - Cas Ord Hrs - Mon to Sat - Balwyn')

            // cheltenham
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 2, month: 5, year: 2023 }), // tuesday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.CALLED_IN_HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.CHELTENHAM,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - Cas Ord Hrs - Mon to Sat - Chelt')

            // essendon
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 2, month: 5, year: 2023 }), // tuesday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.CALLED_IN_HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.ESSENDON,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - Cas Ord Hrs - Mon to Sat - Essen')

            // malvern
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 2, month: 5, year: 2023 }), // tuesday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.CALLED_IN_HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.MALVERN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - Cas Ord Hrs - Mon to Sat - Malvern')

            // mobile
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 2, month: 5, year: 2023 }), // tuesday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.CALLED_IN_HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.MOBILE,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - Cas Ord Hrs - Mon to Sat - Mobile')
        })

        it('should map called in holiday program facilitator for all locations mon-sat - under 18', () => {
            // balwyn
            let row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 2, month: 5, year: 2023 }), // tuesday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.CALLED_IN_HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.BALWYN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - 16&17 Cas Ord Hrs - Mon to Sat - Balw')

            // cheltenham
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 2, month: 5, year: 2023 }), // tuesday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.CALLED_IN_HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.CHELTENHAM,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - 16&17 Cas Ord Hrs - Mon to Sat - Chelt')

            // essendon
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 2, month: 5, year: 2023 }), // tuesday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.CALLED_IN_HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.ESSENDON,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - 16&17 Cas Ord Hrs - Mon to Sat - Essen')

            // malvern
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 2, month: 5, year: 2023 }), // tuesday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.CALLED_IN_HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.MALVERN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - 16&17 Cas Ord Hrs - Mon to Sat - Malv')

            // mobile
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 2, month: 5, year: 2023 }), // tuesday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.CALLED_IN_HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.MOBILE,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - 16&17 Cas Ord Hrs - Mon to Sat - Mobile')
        })

        it('should map called in party facilitator for all locations sunday - over 18', () => {
            // balwyn
            let row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.CALLED_IN_PARTY_FACILITATOR,
                location: Location.BALWYN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - Cas Ord Hrs - Sun - Balwyn')

            // cheltenham
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.CALLED_IN_PARTY_FACILITATOR,
                location: Location.CHELTENHAM,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - Cas Ord Hrs - Sun - Chelt')

            // essendon
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.CALLED_IN_PARTY_FACILITATOR,
                location: Location.ESSENDON,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - Cas Ord Hrs - Sun - Essend')

            // malvern
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.CALLED_IN_PARTY_FACILITATOR,
                location: Location.MALVERN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - Cas Ord Hrs - Sun - Malvern')

            // mobile
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.CALLED_IN_PARTY_FACILITATOR,
                location: Location.MOBILE,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - Cas Ord Hrs - Sun - Mobile')
        })

        it('should map called in party facilitator for all locations sunday - under 18', () => {
            // balwyn
            let row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.CALLED_IN_PARTY_FACILITATOR,
                location: Location.BALWYN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - Cas Ord Hrs - Sun - Balwyn')

            // cheltenham
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.CALLED_IN_PARTY_FACILITATOR,
                location: Location.CHELTENHAM,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - Cas Ord Hrs - Sun - Chelt')

            // essendon
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.CALLED_IN_PARTY_FACILITATOR,
                location: Location.ESSENDON,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - Cas Ord Hrs - Sun - Essend')

            // malvern
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.CALLED_IN_PARTY_FACILITATOR,
                location: Location.MALVERN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - Cas Ord Hrs - Sun - Malvern')

            // mobile
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.CALLED_IN_PARTY_FACILITATOR,
                location: Location.MOBILE,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - Cas Ord Hrs - Sun - Mobile')
        })

        it('should map called in holiday program facilitator for all locations sunday - over 18', () => {
            // balwyn
            let row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.CALLED_IN_HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.BALWYN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - Cas Ord Hrs - Sun - Balwyn')

            // cheltenham
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.CALLED_IN_HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.CHELTENHAM,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - Cas Ord Hrs - Sun - Chelt')

            // essendon
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.CALLED_IN_HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.ESSENDON,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - Cas Ord Hrs - Sun - Essend')

            // malvern
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.CALLED_IN_HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.MALVERN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - Cas Ord Hrs - Sun - Malvern')

            // mobile
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.CALLED_IN_HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.MOBILE,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - Cas Ord Hrs - Sun - Mobile')
        })

        it('should map called in holiday program facilitator for all locations sunday - under 18', () => {
            // balwyn
            let row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.CALLED_IN_HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.BALWYN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - Cas Ord Hrs - Sun - Balwyn')

            // cheltenham
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.CALLED_IN_HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.CHELTENHAM,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - Cas Ord Hrs - Sun - Chelt')

            // essendon
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.CALLED_IN_HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.ESSENDON,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - Cas Ord Hrs - Sun - Essend')

            // malvern
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.CALLED_IN_HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.MALVERN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - Cas Ord Hrs - Sun - Malvern')

            // mobile
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.CALLED_IN_HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.MOBILE,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - Cas Ord Hrs - Sun - Mobile')
        })

        it('should map party faciliator for all locations mon-sat - over 18', () => {
            // balwyn
            let row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.PARTY_FACILITATOR,
                location: Location.BALWYN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Mon to Sat - Balwyn')

            // cheltenham
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.PARTY_FACILITATOR,
                location: Location.CHELTENHAM,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Mon to Sat - Chelt')

            // essendon
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.PARTY_FACILITATOR,
                location: Location.ESSENDON,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Mon to Sat - Essendon')

            // malvern
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.PARTY_FACILITATOR,
                location: Location.MALVERN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Mon to Sat - Malvern')

            // mobile
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.PARTY_FACILITATOR,
                location: Location.MOBILE,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Mon to Sat - Mobile')
        })

        it('should map party faciliator for all locations mon-sat - under 18', () => {
            // balwyn
            let row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.PARTY_FACILITATOR,
                location: Location.BALWYN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, '16&17yo Casual Ordinary Hours - Mon to Sat - Balw')

            // cheltenham
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.PARTY_FACILITATOR,
                location: Location.CHELTENHAM,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, '16&17yo Casual Ordinary Hours - Mon to Sat - Chelt')

            // essendon
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.PARTY_FACILITATOR,
                location: Location.ESSENDON,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, '16&17yo Casual Ordinary Hours - Mon to Sat - Esse')

            // malvern
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.PARTY_FACILITATOR,
                location: Location.MALVERN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, '16&17yo Casual Ordinary Hours - Mon to Sat - Malv')

            // mobile
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.PARTY_FACILITATOR,
                location: Location.MOBILE,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, '16&17yo Casual Ordinary Hours - Mon to Sat - Mobil')
        })

        it('should map party faciliator for all locations sunday - over 18', () => {
            // balwyn
            let row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.PARTY_FACILITATOR,
                location: Location.BALWYN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Balwyn')

            // cheltenham
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.PARTY_FACILITATOR,
                location: Location.CHELTENHAM,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Chelt')

            // essendon
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.PARTY_FACILITATOR,
                location: Location.ESSENDON,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Essendon')

            // malvern
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.PARTY_FACILITATOR,
                location: Location.MALVERN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Malvern')

            // mobile
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.PARTY_FACILITATOR,
                location: Location.MOBILE,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Mobile')
        })

        it('should map party faciliator for all locations sunday - under 18', () => {
            // balwyn
            let row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.PARTY_FACILITATOR,
                location: Location.BALWYN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Balwyn')

            // cheltenham
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.PARTY_FACILITATOR,
                location: Location.CHELTENHAM,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Chelt')

            // essendon
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.PARTY_FACILITATOR,
                location: Location.ESSENDON,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Essendon')

            // malvern
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.PARTY_FACILITATOR,
                location: Location.MALVERN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Malvern')

            // mobile
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.PARTY_FACILITATOR,
                location: Location.MOBILE,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Mobile')
        })

        it('should map holiday program facilitator for all locations mon-sat - over 18', () => {
            // balwyn
            let row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.BALWYN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Mon to Sat - Balwyn')

            // cheltenham
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.CHELTENHAM,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Mon to Sat - Chelt')

            // essendon
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.ESSENDON,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Mon to Sat - Essendon')

            // malvern
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.MALVERN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Mon to Sat - Malvern')

            // mobile
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.MOBILE,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Mon to Sat - Mobile')
        })

        it('should map holiday program facilitator for all locations mon-sat - under 18', () => {
            // balwyn
            let row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.BALWYN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, '16&17yo Casual Ordinary Hours - Mon to Sat - Balw')

            // cheltenham
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.CHELTENHAM,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, '16&17yo Casual Ordinary Hours - Mon to Sat - Chelt')

            // essendon
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.ESSENDON,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, '16&17yo Casual Ordinary Hours - Mon to Sat - Esse')

            // malvern
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.MALVERN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, '16&17yo Casual Ordinary Hours - Mon to Sat - Malv')

            // mobile
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.MOBILE,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, '16&17yo Casual Ordinary Hours - Mon to Sat - Mobil')
        })

        it('should map holiday program facilitator for all locations sunday - over 18', () => {
            // balwyn
            let row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.BALWYN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Balwyn')

            // cheltenham
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.CHELTENHAM,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Chelt')

            // essendon
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.ESSENDON,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Essendon')

            // malvern
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.MALVERN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Malvern')

            // mobile
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.MOBILE,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Mobile')
        })

        it('should map holiday program facilitator for all locations sunday - under 18', () => {
            // balwyn
            let row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.BALWYN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Balwyn')

            // cheltenham
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.CHELTENHAM,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Chelt')

            // essendon
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.ESSENDON,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Essendon')

            // malvern
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.MALVERN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Malvern')

            // mobile
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.MOBILE,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Mobile')
        })

        it('should map science club facilitator for all locations mon-sat - over 18', () => {
            // balwyn
            let row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.SCIENCE_CLUB_FACILITATOR,
                location: Location.BALWYN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Mon to Sat - Balwyn')

            // cheltenham
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.SCIENCE_CLUB_FACILITATOR,
                location: Location.CHELTENHAM,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Mon to Sat - Chelt')

            // essendon
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.SCIENCE_CLUB_FACILITATOR,
                location: Location.ESSENDON,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Mon to Sat - Essendon')

            // malvern
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.SCIENCE_CLUB_FACILITATOR,
                location: Location.MALVERN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Mon to Sat - Malvern')

            // mobile
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.SCIENCE_CLUB_FACILITATOR,
                location: Location.MOBILE,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Mon to Sat - Mobile')
        })

        it('should map science club facilitator for all locations mon-sat - under 18', () => {
            // balwyn
            let row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.SCIENCE_CLUB_FACILITATOR,
                location: Location.BALWYN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, '16&17yo Casual Ordinary Hours - Mon to Sat - Balw')

            // cheltenham
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.SCIENCE_CLUB_FACILITATOR,
                location: Location.CHELTENHAM,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, '16&17yo Casual Ordinary Hours - Mon to Sat - Chelt')

            // essendon
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.SCIENCE_CLUB_FACILITATOR,
                location: Location.ESSENDON,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, '16&17yo Casual Ordinary Hours - Mon to Sat - Esse')

            // malvern
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.SCIENCE_CLUB_FACILITATOR,
                location: Location.MALVERN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, '16&17yo Casual Ordinary Hours - Mon to Sat - Malv')

            // mobile
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.SCIENCE_CLUB_FACILITATOR,
                location: Location.MOBILE,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, '16&17yo Casual Ordinary Hours - Mon to Sat - Mobil')
        })

        it('should map science club facilitator for all locations sunday - over 18', () => {
            // balwyn
            let row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.SCIENCE_CLUB_FACILITATOR,
                location: Location.BALWYN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Balwyn')

            // cheltenham
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.SCIENCE_CLUB_FACILITATOR,
                location: Location.CHELTENHAM,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Chelt')

            // essendon
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.SCIENCE_CLUB_FACILITATOR,
                location: Location.ESSENDON,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Essendon')

            // malvern
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.SCIENCE_CLUB_FACILITATOR,
                location: Location.MALVERN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Malvern')

            // mobile
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.SCIENCE_CLUB_FACILITATOR,
                location: Location.MOBILE,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Mobile')
        })

        it('should map science club facilitator for all locations sunday - under 18', () => {
            // balwyn
            let row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.SCIENCE_CLUB_FACILITATOR,
                location: Location.BALWYN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Balwyn')

            // cheltenham
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.SCIENCE_CLUB_FACILITATOR,
                location: Location.CHELTENHAM,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Chelt')

            // essendon
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.SCIENCE_CLUB_FACILITATOR,
                location: Location.ESSENDON,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Essendon')

            // malvern
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.SCIENCE_CLUB_FACILITATOR,
                location: Location.MALVERN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Malvern')

            // mobile
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.SCIENCE_CLUB_FACILITATOR,
                location: Location.MOBILE,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Mobile')
        })

        it('should map miscellaneous for all locations mon-sat - over 18', () => {
            // balwyn
            let row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.MISCELLANEOUS,
                location: Location.BALWYN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Mon to Sat - Balwyn')

            // cheltenham
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.MISCELLANEOUS,
                location: Location.CHELTENHAM,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Mon to Sat - Chelt')

            // essendon
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.MISCELLANEOUS,
                location: Location.ESSENDON,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Mon to Sat - Essendon')

            // malvern
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.MISCELLANEOUS,
                location: Location.MALVERN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Mon to Sat - Malvern')

            // mobile
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.MISCELLANEOUS,
                location: Location.MOBILE,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Mon to Sat - Mobile')
        })

        it('should map miscellaneous for all locations mon-sat - under 18', () => {
            // balwyn
            let row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.MISCELLANEOUS,
                location: Location.BALWYN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, '16&17yo Casual Ordinary Hours - Mon to Sat - Balw')

            // cheltenham
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.MISCELLANEOUS,
                location: Location.CHELTENHAM,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, '16&17yo Casual Ordinary Hours - Mon to Sat - Chelt')

            // essendon
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.MISCELLANEOUS,
                location: Location.ESSENDON,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, '16&17yo Casual Ordinary Hours - Mon to Sat - Esse')

            // malvern
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.MISCELLANEOUS,
                location: Location.MALVERN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, '16&17yo Casual Ordinary Hours - Mon to Sat - Malv')

            // mobile
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.MISCELLANEOUS,
                location: Location.MOBILE,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, '16&17yo Casual Ordinary Hours - Mon to Sat - Mobil')
        })

        it('should map miscellaneous for all locations sunday - over 18', () => {
            // balwyn
            let row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.MISCELLANEOUS,
                location: Location.BALWYN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Balwyn')

            // cheltenham
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.MISCELLANEOUS,
                location: Location.CHELTENHAM,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Chelt')

            // essendon
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.MISCELLANEOUS,
                location: Location.ESSENDON,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Essendon')

            // malvern
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.MISCELLANEOUS,
                location: Location.MALVERN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Malvern')

            // mobile
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.MISCELLANEOUS,
                location: Location.MOBILE,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Mobile')
        })

        it('should map miscellaneous for all locations sunday - under 18', () => {
            // balwyn
            let row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.MISCELLANEOUS,
                location: Location.BALWYN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Balwyn')

            // cheltenham
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.MISCELLANEOUS,
                location: Location.CHELTENHAM,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Chelt')

            // essendon
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.MISCELLANEOUS,
                location: Location.ESSENDON,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Essendon')

            // malvern
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.MISCELLANEOUS,
                location: Location.MALVERN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Malvern')

            // mobile
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.MISCELLANEOUS,
                location: Location.MOBILE,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Mobile')
        })

        it('should map non casual staff to ordinary hours mon-sat', () => {
            // balwyn
            let row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: false,
                position: Position.MISCELLANEOUS,
                location: Location.BALWYN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'PT/FT Ordinary Hours - Mon to Sat - Balwyn')

            // cheltenham
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: false,
                position: Position.MISCELLANEOUS,
                location: Location.CHELTENHAM,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'PT/FT Ordinary Hours - Mon to Sat - Chelt')

            // essendon
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: false,
                position: Position.MISCELLANEOUS,
                location: Location.ESSENDON,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'PT/FT Ordinary Hours - Mon to Sat - Essendon')

            // malvern
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: false,
                position: Position.MISCELLANEOUS,
                location: Location.MALVERN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'PT/FT Ordinary Hours - Mon to Sat - Malvern')

            // mobile
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: false,
                position: Position.MISCELLANEOUS,
                location: Location.MOBILE,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'PT/FT Ordinary Hours - Mon to Sat - Mobile')
        })

        it('should map non casual staff to ordinary hours sunday', () => {
            // balwyn
            let row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: false,
                position: Position.MISCELLANEOUS,
                location: Location.BALWYN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'PT/FT Ordinary Hours - Sunday - Balwyn')

            // cheltenham
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: false,
                position: Position.MISCELLANEOUS,
                location: Location.CHELTENHAM,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'PT/FT Ordinary Hours - Sunday - Chelt')

            // essendon
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: false,
                position: Position.MISCELLANEOUS,
                location: Location.ESSENDON,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'PT/FT Ordinary Hours - Sunday - Essendon')

            // malvern
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: false,
                position: Position.MISCELLANEOUS,
                location: Location.MALVERN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'PT/FT Ordinary Hours - Sunday - Malvern')

            // mobile
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: false,
                position: Position.MISCELLANEOUS,
                location: Location.MOBILE,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'PT/FT Ordinary Hours - Sunday - Mobile')
        })

        it('should map overtime first three hours - mon to sat', () => {
            // balwyn
            let row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: false,
                position: Position.MISCELLANEOUS,
                location: Location.BALWYN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: true, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Overtime Hours - First 3 Hrs - Mon to Sat - Balwyn')

            // cheltenham
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: false,
                position: Position.MISCELLANEOUS,
                location: Location.CHELTENHAM,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: true, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Overtime Hours - First 3 Hrs - Mon to Sat - Chelt')

            // essendon
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: false,
                position: Position.MISCELLANEOUS,
                location: Location.ESSENDON,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: true, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Overtime Hours - First 3 Hrs - Mon to Sat - Essen')

            // malvern
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: false,
                position: Position.MISCELLANEOUS,
                location: Location.MALVERN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: true, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Overtime Hours - First 3 Hrs - Mon to Sat - Malv')

            // mobile
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: false,
                position: Position.MISCELLANEOUS,
                location: Location.MOBILE,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: true, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Overtime Hours - First 3 Hrs - Mon to Sat - Mobile')
        })

        it('should map overtime first three hours - sunday', () => {
            // balwyn
            let row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: false,
                position: Position.MISCELLANEOUS,
                location: Location.BALWYN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: true, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Overtime Hours - First 3 Hrs - Sunday - Balwyn')

            // cheltenham
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: false,
                position: Position.MISCELLANEOUS,
                location: Location.CHELTENHAM,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: true, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Overtime Hours - First 3 Hrs - Sunday - Cheltenham')

            // essendon
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: false,
                position: Position.MISCELLANEOUS,
                location: Location.ESSENDON,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: true, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Overtime Hours - First 3 Hrs - Sunday - Essendon')

            // malvern
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: false,
                position: Position.MISCELLANEOUS,
                location: Location.MALVERN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: true, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Overtime Hours - First 3 Hrs - Sunday - Malvern')

            // mobile
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: false,
                position: Position.MISCELLANEOUS,
                location: Location.MOBILE,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: true, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Overtime Hours - First 3 Hrs - Sunday - Mobile')
        })

        it('should map overtime after three hours', () => {
            // balwyn
            let row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: false,
                position: Position.MISCELLANEOUS,
                location: Location.BALWYN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: true },
            })
            strictEqual(row.payItem, 'Overtime Hours - After 3 Hrs - Balwyn')

            // cheltenham
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: false,
                position: Position.MISCELLANEOUS,
                location: Location.CHELTENHAM,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: true },
            })
            strictEqual(row.payItem, 'Overtime Hours - After 3 Hrs - Cheltenham')

            // essendon
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: false,
                position: Position.MISCELLANEOUS,
                location: Location.ESSENDON,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: true },
            })
            strictEqual(row.payItem, 'Overtime Hours - After 3 Hrs - Essendon')

            // malvern
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: false,
                position: Position.MISCELLANEOUS,
                location: Location.MALVERN,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: true },
            })
            strictEqual(row.payItem, 'Overtime Hours - After 3 Hrs - Malvern')

            // mobile
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                hasBirthdayDuringPayrun: true,
                isCasual: false,
                position: Position.MISCELLANEOUS,
                location: Location.MOBILE,
                hours: 8,
                rate: 'not required',
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: true },
            })
            strictEqual(row.payItem, 'Overtime Hours - After 3 Hrs - Mobile')
        })

        it('should map casual ordinary hours for employees under 18 on a rate above $18 on mon-sat to over 18 mon-sat', () => {
            // balwyn
            let row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.MISCELLANEOUS,
                location: Location.BALWYN,
                hours: 8,
                rate: 14.4,
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Mon to Sat - Balwyn')

            // cheltenham
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.MISCELLANEOUS,
                location: Location.CHELTENHAM,
                hours: 8,
                rate: 14.4,
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Mon to Sat - Chelt')

            // essendon
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.MISCELLANEOUS,
                location: Location.ESSENDON,
                hours: 8,
                rate: 14.4,
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Mon to Sat - Essendon')

            // malvern
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.MISCELLANEOUS,
                location: Location.MALVERN,
                hours: 8,
                rate: 14.4,
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Mon to Sat - Malvern')

            // mobile
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.MISCELLANEOUS,
                location: Location.MOBILE,
                hours: 8,
                rate: 14.4,
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Mon to Sat - Mobile')
        })

        it('should map casual ordinary hours for employees under 18 on a rate under $18 on mon-sat to under 18 mon-sat', () => {
            // balwyn
            let row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.MISCELLANEOUS,
                location: Location.BALWYN,
                hours: 8,
                rate: 14.3,
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, '16&17yo Casual Ordinary Hours - Mon to Sat - Balw')

            // cheltenham
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.MISCELLANEOUS,
                location: Location.CHELTENHAM,
                hours: 8,
                rate: 14.3,
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, '16&17yo Casual Ordinary Hours - Mon to Sat - Chelt')

            // essendon
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.MISCELLANEOUS,
                location: Location.ESSENDON,
                hours: 8,
                rate: 14.3,
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, '16&17yo Casual Ordinary Hours - Mon to Sat - Esse')

            // malvern
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.MISCELLANEOUS,
                location: Location.MALVERN,
                hours: 8,
                rate: 14.3,
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, '16&17yo Casual Ordinary Hours - Mon to Sat - Malv')

            // mobile
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.MISCELLANEOUS,
                location: Location.MOBILE,
                hours: 8,
                rate: 14.3,
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, '16&17yo Casual Ordinary Hours - Mon to Sat - Mobil')
        })

        it('should map on call for employees under 18 on a rate above $18 on mon-sat to over 18 mon-sat', () => {
            // balwyn
            let row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.ON_CALL,
                location: Location.BALWYN,
                hours: 8,
                rate: 14.4,
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'ON CALL - Cas Ord Hrs - Mon to Sat - Balwyn')

            // cheltenham
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.ON_CALL,
                location: Location.CHELTENHAM,
                hours: 8,
                rate: 14.4,
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'ON CALL - Cas Ord Hrs - Mon to Sat - Chelt')

            // essendon
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.ON_CALL,
                location: Location.ESSENDON,
                hours: 8,
                rate: 14.4,
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'ON CALL - Cas Ord Hrs - Mon to Sat - Essen')

            // malvern
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.ON_CALL,
                location: Location.MALVERN,
                hours: 8,
                rate: 14.4,
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'ON CALL - Cas Ord Hrs - Mon to Sat - Malv')

            // mobile
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.ON_CALL,
                location: Location.MOBILE,
                hours: 8,
                rate: 14.4,
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'ON CALL - Cas Ord Hrs - Mon to Sat - Mobile')
        })

        it('should map casual ordinary hours for employees under 18 on a rate under $18 on mon-sat to under 18 mon-sat', () => {
            // balwyn
            let row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.ON_CALL,
                location: Location.BALWYN,
                hours: 8,
                rate: 14.3,
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'On call - 16&17yo Csl Or Hs - Mon to Sat - Balw')

            // cheltenham
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.ON_CALL,
                location: Location.CHELTENHAM,
                hours: 8,
                rate: 14.3,
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'On call - 16&17yo Csl Or Hs - Mon to Sat - Chelt')

            // essendon
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.ON_CALL,
                location: Location.ESSENDON,
                hours: 8,
                rate: 14.3,
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'On call - 16&17yo Csl Or Hs - Mon to Sat - Essen')

            // malvern
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.ON_CALL,
                location: Location.MALVERN,
                hours: 8,
                rate: 14.3,
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'On call - 16&17yo Csl Or Hs - Mon to Sat - Malvern')

            // mobile
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                position: Position.ON_CALL,
                location: Location.MOBILE,
                hours: 8,
                rate: 14.3,
                summary: '',
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'On call - 16&17yo Csl Or Hs - Mon to Sat - Mobile')
        })
    })

    describe('Creating timesheet rows', () => {
        const xeroUser: Employee = {
            firstName: 'Ryan',
            lastName: 'Saffer',
            dateOfBirth: DateTime.fromObject({ day: 2, month: 5, year: 1993 }).toISO(),
        }
        it('should not reach overtime - non casual - 30 hours', () => {
            // given
            const timesheets: Timesheet[] = [
                {
                    dtstart: '2023-05-01T10:00:00+10:00',
                    dtend: '2023-05-01T20:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                    summary: '',
                },
                {
                    dtstart: '2023-05-02T10:00:00+10:00',
                    dtend: '2023-05-02T20:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                    summary: '',
                },
                {
                    dtstart: '2023-05-03T10:00:00+10:00',
                    dtend: '2023-05-03T20:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                    summary: '',
                },
            ]

            // when
            const { rows } = createTimesheetRows({
                firstName: xeroUser.firstName,
                lastName: xeroUser.lastName,
                dob: DateTime.fromISO(xeroUser.dateOfBirth),
                hasBirthdayDuringPayrun: false,
                isCasual: false,
                overtimeThreshold: 30,
                usersTimesheets: timesheets,
                rate: 'not required',
                timezone: 'Australia/Melbourne',
            })

            // then
            strictEqual(rows.length, 3)

            strictEqual(rows[0].payItem, 'PT/FT Ordinary Hours - Mon to Sat - Balwyn')
            strictEqual(rows[0].hours, 10)

            strictEqual(rows[1].payItem, 'PT/FT Ordinary Hours - Mon to Sat - Balwyn')
            strictEqual(rows[1].hours, 10)

            strictEqual(rows[2].payItem, 'PT/FT Ordinary Hours - Mon to Sat - Balwyn')
            strictEqual(rows[2].hours, 10)
        })

        it('should reach overtime - non casual - 40 hours - first overtime shift over 3 hours', () => {
            // given
            const timesheets: Timesheet[] = [
                {
                    // 10 hours
                    dtstart: '2023-05-01T10:00:00+10:00',
                    dtend: '2023-05-01T20:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                    summary: '',
                },
                {
                    // 10 hours
                    dtstart: '2023-05-02T10:00:00+10:00',
                    dtend: '2023-05-02T20:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                    summary: '',
                },
                {
                    // 8 hours
                    dtstart: '2023-05-03T10:00:00+10:00',
                    dtend: '2023-05-03T18:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                    summary: '',
                },
                {
                    // 7 hours (first 2 should okay, then next 5 overtime. first three should be under three hours, then last 2 over three hours)
                    dtstart: '2023-05-04T10:00:00+10:00',
                    dtend: '2023-05-04T17:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                    summary: '',
                },
                {
                    // 5 hours
                    dtstart: '2023-05-05T10:00:00+10:00',
                    dtend: '2023-05-05T15:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                    summary: '',
                },
            ]

            // when
            const { rows } = createTimesheetRows({
                firstName: xeroUser.firstName,
                lastName: xeroUser.lastName,
                dob: DateTime.fromISO(xeroUser.dateOfBirth),
                hasBirthdayDuringPayrun: false,
                isCasual: false,
                overtimeThreshold: 30,
                usersTimesheets: timesheets,
                rate: 'not required',
                timezone: 'Australia/Melbourne',
            })

            // then
            strictEqual(rows.length, 7)

            strictEqual(rows[0].payItem, 'PT/FT Ordinary Hours - Mon to Sat - Balwyn')
            strictEqual(rows[0].hours, 10)

            strictEqual(rows[1].payItem, 'PT/FT Ordinary Hours - Mon to Sat - Balwyn')
            strictEqual(rows[1].hours, 10)

            strictEqual(rows[2].payItem, 'PT/FT Ordinary Hours - Mon to Sat - Balwyn')
            strictEqual(rows[2].hours, 8)

            strictEqual(rows[3].payItem, 'PT/FT Ordinary Hours - Mon to Sat - Balwyn')
            strictEqual(rows[3].hours, 2)

            strictEqual(rows[4].payItem, 'Overtime Hours - First 3 Hrs - Mon to Sat - Balwyn')
            strictEqual(rows[4].hours, 3)

            strictEqual(rows[5].payItem, 'Overtime Hours - After 3 Hrs - Balwyn')
            strictEqual(rows[5].hours, 2)

            strictEqual(rows[6].payItem, 'Overtime Hours - After 3 Hrs - Balwyn')
            strictEqual(rows[6].hours, 5)
        })

        it('should reach overtime - non casual - 40 hours - first overtime shift under 3 hours', () => {
            // given
            const timesheets: Timesheet[] = [
                {
                    // 10 hours
                    dtstart: '2023-05-01T10:00:00+10:00',
                    dtend: '2023-05-01T20:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                    summary: '',
                },
                {
                    // 10 hours
                    dtstart: '2023-05-02T10:00:00+10:00',
                    dtend: '2023-05-02T20:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                    summary: '',
                },
                {
                    // 8 hours
                    dtstart: '2023-05-03T10:00:00+10:00',
                    dtend: '2023-05-03T18:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                    summary: '',
                },
                {
                    // 4 hours (first 2 should okay, then next 2 overtime, under three hours.)
                    dtstart: '2023-05-04T10:00:00+10:00',
                    dtend: '2023-05-04T14:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                    summary: '',
                },
                {
                    // 5 hours (first hour under three hours overtime, next 4 over three hours)
                    dtstart: '2023-05-05T10:00:00+10:00',
                    dtend: '2023-05-05T15:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                    summary: '',
                },
            ]

            // when
            const { rows } = createTimesheetRows({
                firstName: xeroUser.firstName,
                lastName: xeroUser.lastName,
                dob: DateTime.fromISO(xeroUser.dateOfBirth),
                hasBirthdayDuringPayrun: true,
                isCasual: false,
                overtimeThreshold: 30,
                usersTimesheets: timesheets,
                rate: 'not required',
                timezone: 'Australia/Melbourne',
            })

            // then
            strictEqual(rows.length, 7)

            strictEqual(rows[0].payItem, 'PT/FT Ordinary Hours - Mon to Sat - Balwyn')
            strictEqual(rows[0].hours, 10)

            strictEqual(rows[1].payItem, 'PT/FT Ordinary Hours - Mon to Sat - Balwyn')
            strictEqual(rows[1].hours, 10)

            strictEqual(rows[2].payItem, 'PT/FT Ordinary Hours - Mon to Sat - Balwyn')
            strictEqual(rows[2].hours, 8)

            strictEqual(rows[3].payItem, 'PT/FT Ordinary Hours - Mon to Sat - Balwyn')
            strictEqual(rows[3].hours, 2)

            strictEqual(rows[4].payItem, 'Overtime Hours - First 3 Hrs - Mon to Sat - Balwyn')
            strictEqual(rows[4].hours, 2)

            strictEqual(rows[5].payItem, 'Overtime Hours - First 3 Hrs - Mon to Sat - Balwyn')
            strictEqual(rows[5].hours, 1)

            strictEqual(rows[6].payItem, 'Overtime Hours - After 3 Hrs - Balwyn')
            strictEqual(rows[6].hours, 4)
        })

        it('should not reach overtime - casual - 38 hours', () => {
            // given
            const timesheets: Timesheet[] = [
                {
                    dtstart: '2023-05-01T10:00:00+10:00',
                    dtend: '2023-05-01T20:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                    summary: '',
                },
                {
                    dtstart: '2023-05-02T10:00:00+10:00',
                    dtend: '2023-05-02T20:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                    summary: '',
                },
                {
                    dtstart: '2023-05-03T10:00:00+10:00',
                    dtend: '2023-05-03T20:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                    summary: '',
                },
                {
                    dtstart: '2023-05-04T10:00:00+10:00',
                    dtend: '2023-05-04T18:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                    summary: '',
                },
            ]

            // when
            const { rows } = createTimesheetRows({
                firstName: xeroUser.firstName,
                lastName: xeroUser.lastName,
                dob: DateTime.fromISO(xeroUser.dateOfBirth),
                hasBirthdayDuringPayrun: false,
                isCasual: true,
                overtimeThreshold: 38,
                usersTimesheets: timesheets,
                rate: 'not required',
                timezone: 'Australia/Melbourne',
            })

            // then
            strictEqual(rows.length, 4)

            strictEqual(rows[0].payItem, 'Casual Ordinary Hours - Mon to Sat - Balwyn')
            strictEqual(rows[0].hours, 10)

            strictEqual(rows[1].payItem, 'Casual Ordinary Hours - Mon to Sat - Balwyn')
            strictEqual(rows[1].hours, 10)

            strictEqual(rows[2].payItem, 'Casual Ordinary Hours - Mon to Sat - Balwyn')
            strictEqual(rows[2].hours, 10)

            strictEqual(rows[3].payItem, 'Casual Ordinary Hours - Mon to Sat - Balwyn')
            strictEqual(rows[3].hours, 8)
        })

        it('should reach overtime - casual - 48 hours - first overtime shift over 3 hours', () => {
            // given
            const timesheets: Timesheet[] = [
                {
                    // 10 hours
                    dtstart: '2023-05-01T10:00:00+10:00',
                    dtend: '2023-05-01T20:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                    summary: '',
                },
                {
                    // 10 hours
                    dtstart: '2023-05-02T10:00:00+10:00',
                    dtend: '2023-05-02T20:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                    summary: '',
                },
                {
                    // 10 hours
                    dtstart: '2023-05-03T10:00:00+10:00',
                    dtend: '2023-05-03T20:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                    summary: '',
                },
                {
                    // 6 hours
                    dtstart: '2023-05-04T10:00:00+10:00',
                    dtend: '2023-05-04T16:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                    summary: '',
                },
                {
                    // 7 hours (first 2 should okay, then next 5 overtime. first three should be under three hours, then last 2 over three hours)
                    dtstart: '2023-05-05T10:00:00+10:00',
                    dtend: '2023-05-05T17:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                    summary: '',
                },
                {
                    // 5 hours
                    dtstart: '2023-05-06T10:00:00+10:00',
                    dtend: '2023-05-06T15:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                    summary: '',
                },
            ]

            // when
            const { rows } = createTimesheetRows({
                firstName: xeroUser.firstName,
                lastName: xeroUser.lastName,
                dob: DateTime.fromISO(xeroUser.dateOfBirth),
                hasBirthdayDuringPayrun: false,
                isCasual: true,
                overtimeThreshold: 38,
                usersTimesheets: timesheets,
                rate: 'not required',
                timezone: 'Australia/Melbourne',
            })

            // then
            strictEqual(rows.length, 8)

            strictEqual(rows[0].payItem, 'Casual Ordinary Hours - Mon to Sat - Balwyn')
            strictEqual(rows[0].hours, 10)

            strictEqual(rows[1].payItem, 'Casual Ordinary Hours - Mon to Sat - Balwyn')
            strictEqual(rows[1].hours, 10)

            strictEqual(rows[2].payItem, 'Casual Ordinary Hours - Mon to Sat - Balwyn')
            strictEqual(rows[2].hours, 10)

            strictEqual(rows[3].payItem, 'Casual Ordinary Hours - Mon to Sat - Balwyn')
            strictEqual(rows[3].hours, 6)

            strictEqual(rows[4].payItem, 'Casual Ordinary Hours - Mon to Sat - Balwyn')
            strictEqual(rows[4].hours, 2)

            strictEqual(rows[5].payItem, 'Overtime Hours - First 3 Hrs - Mon to Sat - Balwyn')
            strictEqual(rows[5].hours, 3)

            strictEqual(rows[6].payItem, 'Overtime Hours - After 3 Hrs - Balwyn')
            strictEqual(rows[6].hours, 2)

            strictEqual(rows[7].payItem, 'Overtime Hours - After 3 Hrs - Balwyn')
            strictEqual(rows[7].hours, 5)
        })

        it('should reach overtime - casual - 48 hours - first overtime shift under 3 hours', () => {
            // given
            const timesheets: Timesheet[] = [
                {
                    // 10 hours
                    dtstart: '2023-05-01T10:00:00+10:00',
                    dtend: '2023-05-01T20:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                    summary: '',
                },
                {
                    // 10 hours
                    dtstart: '2023-05-02T10:00:00+10:00',
                    dtend: '2023-05-02T20:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                    summary: '',
                },
                {
                    // 10 hours
                    dtstart: '2023-05-03T10:00:00+10:00',
                    dtend: '2023-05-03T20:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                    summary: '',
                },
                {
                    // 6 hours
                    dtstart: '2023-05-04T10:00:00+10:00',
                    dtend: '2023-05-04T16:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                    summary: '',
                },
                {
                    // 4 hours (first 2 should okay, then next 2 overtime, under three hours.)
                    dtstart: '2023-05-05T10:00:00+10:00',
                    dtend: '2023-05-05T14:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                    summary: '',
                },
                {
                    // 5 hours (first hour under three hours overtime, next 4 over three hours)
                    dtstart: '2023-05-06T10:00:00+10:00',
                    dtend: '2023-05-06T15:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                    summary: '',
                },
            ]

            // when
            const { rows } = createTimesheetRows({
                firstName: xeroUser.firstName,
                lastName: xeroUser.lastName,
                dob: DateTime.fromISO(xeroUser.dateOfBirth),
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                overtimeThreshold: 38,
                usersTimesheets: timesheets,
                rate: 'not required',
                timezone: 'Australia/Melbourne',
            })

            // then
            strictEqual(rows.length, 8)

            strictEqual(rows[0].payItem, 'Casual Ordinary Hours - Mon to Sat - Balwyn')
            strictEqual(rows[0].hours, 10)

            strictEqual(rows[1].payItem, 'Casual Ordinary Hours - Mon to Sat - Balwyn')
            strictEqual(rows[1].hours, 10)

            strictEqual(rows[2].payItem, 'Casual Ordinary Hours - Mon to Sat - Balwyn')
            strictEqual(rows[2].hours, 10)

            strictEqual(rows[3].payItem, 'Casual Ordinary Hours - Mon to Sat - Balwyn')
            strictEqual(rows[3].hours, 6)

            strictEqual(rows[4].payItem, 'Casual Ordinary Hours - Mon to Sat - Balwyn')
            strictEqual(rows[4].hours, 2)

            strictEqual(rows[5].payItem, 'Overtime Hours - First 3 Hrs - Mon to Sat - Balwyn')
            strictEqual(rows[5].hours, 2)

            strictEqual(rows[6].payItem, 'Overtime Hours - First 3 Hrs - Mon to Sat - Balwyn')
            strictEqual(rows[6].hours, 1)

            strictEqual(rows[7].payItem, 'Overtime Hours - After 3 Hrs - Balwyn')
            strictEqual(rows[7].hours, 4)
        })

        it('should go into overtime if shift length is more than 10 hours - 3 hours over', () => {
            // given
            const timesheets: Timesheet[] = [
                {
                    // 10 hours
                    dtstart: '2023-05-01T10:00:00+10:00',
                    dtend: '2023-05-01T23:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                    summary: '',
                },
            ]

            // when
            const { rows } = createTimesheetRows({
                firstName: xeroUser.firstName,
                lastName: xeroUser.lastName,
                dob: DateTime.fromISO(xeroUser.dateOfBirth),
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                overtimeThreshold: 38,
                usersTimesheets: timesheets,
                rate: 'not required',
                timezone: 'Australia/Melbourne',
            })

            // then
            strictEqual(rows.length, 2)

            strictEqual(rows[0].payItem, 'Casual Ordinary Hours - Mon to Sat - Balwyn')
            strictEqual(rows[0].hours, 10)

            strictEqual(rows[1].payItem, 'Overtime Hours - First 3 Hrs - Mon to Sat - Balwyn')
            strictEqual(rows[1].hours, 3)
        })

        it('should go into overtime if shift length is more than 10 hours - 8 hours over', () => {
            // given
            const timesheets: Timesheet[] = [
                {
                    // 18 hours
                    dtstart: '2023-05-01T00:00:00+10:00',
                    dtend: '2023-05-01T18:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                    summary: '',
                },
            ]

            // when
            const { rows } = createTimesheetRows({
                firstName: xeroUser.firstName,
                lastName: xeroUser.lastName,
                dob: DateTime.fromISO(xeroUser.dateOfBirth),
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                overtimeThreshold: 38,
                usersTimesheets: timesheets,
                rate: 'not required',
                timezone: 'Australia/Melbourne',
            })

            // then
            strictEqual(rows.length, 3)

            strictEqual(rows[0].payItem, 'Casual Ordinary Hours - Mon to Sat - Balwyn')
            strictEqual(rows[0].hours, 10)

            strictEqual(rows[1].payItem, 'Overtime Hours - First 3 Hrs - Mon to Sat - Balwyn')
            strictEqual(rows[1].hours, 3)

            strictEqual(rows[2].payItem, 'Overtime Hours - After 3 Hrs - Balwyn')
            strictEqual(rows[2].hours, 5)
        })

        it('should calculate correct overtime if shift over 10 hours done within 10 hours of overtime', () => {
            // given
            const timesheets: Timesheet[] = [
                {
                    // 10 hours
                    dtstart: '2023-05-01T10:00:00+10:00',
                    dtend: '2023-05-01T20:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                    summary: '',
                },
                {
                    // 10 hours
                    dtstart: '2023-05-02T10:00:00+10:00',
                    dtend: '2023-05-02T20:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                    summary: '',
                },
                {
                    // 10 hours
                    dtstart: '2023-05-03T10:00:00+10:00',
                    dtend: '2023-05-03T20:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                    summary: '',
                },
                {
                    // 3 hours
                    dtstart: '2023-05-04T10:00:00+10:00',
                    dtend: '2023-05-04T13:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                    summary: '',
                },
                {
                    // 12 hours - only 5 hours left until overtime
                    dtstart: '2023-05-05T10:00:00+10:00',
                    dtend: '2023-05-05T22:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                    summary: '',
                },
            ]

            // when
            const { rows } = createTimesheetRows({
                firstName: xeroUser.firstName,
                lastName: xeroUser.lastName,
                dob: DateTime.fromISO(xeroUser.dateOfBirth),
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                overtimeThreshold: 38,
                usersTimesheets: timesheets,
                rate: 'not required',
                timezone: 'Australia/Melbourne',
            })

            // then
            strictEqual(rows.length, 7)

            strictEqual(rows[0].payItem, 'Casual Ordinary Hours - Mon to Sat - Balwyn')
            strictEqual(rows[0].hours, 10)

            strictEqual(rows[1].payItem, 'Casual Ordinary Hours - Mon to Sat - Balwyn')
            strictEqual(rows[1].hours, 10)

            strictEqual(rows[2].payItem, 'Casual Ordinary Hours - Mon to Sat - Balwyn')
            strictEqual(rows[2].hours, 10)

            strictEqual(rows[3].payItem, 'Casual Ordinary Hours - Mon to Sat - Balwyn')
            strictEqual(rows[3].hours, 3)

            strictEqual(rows[4].payItem, 'Casual Ordinary Hours - Mon to Sat - Balwyn')
            strictEqual(rows[4].hours, 5)

            strictEqual(rows[5].payItem, 'Overtime Hours - First 3 Hrs - Mon to Sat - Balwyn')
            strictEqual(rows[5].hours, 3)

            strictEqual(rows[6].payItem, 'Overtime Hours - After 3 Hrs - Balwyn')
            strictEqual(rows[6].hours, 4)
        })

        it('should calculate correct overtime if shift over 10 hours (but 13 or under) done but not within 10 hours of overtime', () => {
            // given
            const timesheets: Timesheet[] = [
                {
                    // 10 hours
                    dtstart: '2023-05-01T10:00:00+10:00',
                    dtend: '2023-05-01T20:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                    summary: '',
                },
                {
                    // 10 hours
                    dtstart: '2023-05-02T10:00:00+10:00',
                    dtend: '2023-05-02T20:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                    summary: '',
                },
                {
                    // 4 hours - 14 hours until overtime
                    dtstart: '2023-05-03T10:00:00+10:00',
                    dtend: '2023-05-03T14:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                    summary: '',
                },
                {
                    // 13 hours - first 10 should be normal, then 3 hours overtime
                    dtstart: '2023-05-04T00:00:00+10:00',
                    dtend: '2023-05-04T13:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                    summary: '',
                },
                {
                    // 5 hours - first hour normal, but then rest overtime
                    dtstart: '2023-05-05T10:00:00+10:00',
                    dtend: '2023-05-05T15:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                    summary: '',
                },
            ]

            // when
            const { rows } = createTimesheetRows({
                firstName: xeroUser.firstName,
                lastName: xeroUser.lastName,
                dob: DateTime.fromISO(xeroUser.dateOfBirth),
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                overtimeThreshold: 38,
                usersTimesheets: timesheets,
                rate: 'not required',
                timezone: 'Australia/Melbourne',
            })

            // then
            strictEqual(rows.length, 8)

            strictEqual(rows[0].payItem, 'Casual Ordinary Hours - Mon to Sat - Balwyn')
            strictEqual(rows[0].hours, 10)

            strictEqual(rows[1].payItem, 'Casual Ordinary Hours - Mon to Sat - Balwyn')
            strictEqual(rows[1].hours, 10)

            strictEqual(rows[2].payItem, 'Casual Ordinary Hours - Mon to Sat - Balwyn')
            strictEqual(rows[2].hours, 4)

            strictEqual(rows[3].payItem, 'Casual Ordinary Hours - Mon to Sat - Balwyn')
            strictEqual(rows[3].hours, 10)

            strictEqual(rows[4].payItem, 'Overtime Hours - First 3 Hrs - Mon to Sat - Balwyn')
            strictEqual(rows[4].hours, 3)

            strictEqual(rows[5].payItem, 'Casual Ordinary Hours - Mon to Sat - Balwyn')
            strictEqual(rows[5].hours, 1)

            strictEqual(rows[6].payItem, 'Overtime Hours - First 3 Hrs - Mon to Sat - Balwyn')
            strictEqual(rows[6].hours, 3)

            strictEqual(rows[7].payItem, 'Overtime Hours - After 3 Hrs - Balwyn')
            strictEqual(rows[7].hours, 1)
        })

        it('should calculate correct overtime if shift over 10 hours (above 13) done but not within 10 hours of overtime', () => {
            // given
            const timesheets: Timesheet[] = [
                {
                    // 10 hours
                    dtstart: '2023-05-01T10:00:00+10:00',
                    dtend: '2023-05-01T20:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                    summary: '',
                },
                {
                    // 10 hours
                    dtstart: '2023-05-02T10:00:00+10:00',
                    dtend: '2023-05-02T20:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                    summary: '',
                },
                {
                    // 3 hours - 15 hours until overtime
                    dtstart: '2023-05-03T10:00:00+10:00',
                    dtend: '2023-05-03T13:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                    summary: '',
                },
                {
                    // 14 hours - first 10 should be normal, then 4 hours overtime
                    dtstart: '2023-05-04T00:00:00+10:00',
                    dtend: '2023-05-04T14:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                    summary: '',
                },
                {
                    // 5 hours - first hour normal, but then rest overtime
                    dtstart: '2023-05-05T10:00:00+10:00',
                    dtend: '2023-05-05T15:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                    summary: '',
                },
            ]

            // when
            const { rows } = createTimesheetRows({
                firstName: xeroUser.firstName,
                lastName: xeroUser.lastName,
                dob: DateTime.fromISO(xeroUser.dateOfBirth),
                hasBirthdayDuringPayrun: true,
                isCasual: true,
                overtimeThreshold: 38,
                usersTimesheets: timesheets,
                rate: 'not required',
                timezone: 'Australia/Melbourne',
            })

            // then
            strictEqual(rows.length, 9)

            strictEqual(rows[0].payItem, 'Casual Ordinary Hours - Mon to Sat - Balwyn')
            strictEqual(rows[0].hours, 10)

            strictEqual(rows[1].payItem, 'Casual Ordinary Hours - Mon to Sat - Balwyn')
            strictEqual(rows[1].hours, 10)

            strictEqual(rows[2].payItem, 'Casual Ordinary Hours - Mon to Sat - Balwyn')
            strictEqual(rows[2].hours, 3)

            strictEqual(rows[3].payItem, 'Casual Ordinary Hours - Mon to Sat - Balwyn')
            strictEqual(rows[3].hours, 10)

            strictEqual(rows[4].payItem, 'Overtime Hours - First 3 Hrs - Mon to Sat - Balwyn')
            strictEqual(rows[4].hours, 3)

            strictEqual(rows[5].payItem, 'Overtime Hours - After 3 Hrs - Balwyn')
            strictEqual(rows[5].hours, 1)

            strictEqual(rows[6].payItem, 'Casual Ordinary Hours - Mon to Sat - Balwyn')
            strictEqual(rows[6].hours, 1)

            strictEqual(rows[7].payItem, 'Overtime Hours - First 3 Hrs - Mon to Sat - Balwyn')
            strictEqual(rows[7].hours, 3)

            strictEqual(rows[8].payItem, 'Overtime Hours - After 3 Hrs - Balwyn')
            strictEqual(rows[8].hours, 1)
        })
    })

    describe('Birthday calculations', () => {
        it('should return true when birthday is in range', () => {
            // given
            const birthday = DateTime.fromObject({ day: 2, month: 5, year: 1993 })
            const start = DateTime.fromObject({ day: 20, month: 4, year: 2023 })
            const end = DateTime.fromObject({ day: 5, month: 5, year: 2023 })

            // when
            const result = hasBirthdayDuring(birthday, start, end)

            // then
            strictEqual(result, true)
        })

        it('should return true when birthday is in range - start is birthday', () => {
            // given
            const birthday = DateTime.fromObject({ day: 2, month: 5, year: 1993 })
            const start = DateTime.fromObject({ day: 2, month: 5, year: 2023 })
            const end = DateTime.fromObject({ day: 20, month: 5, year: 2023 })

            // when
            const result = hasBirthdayDuring(birthday, start, end)

            // then
            strictEqual(result, true)
        })

        it('should return true when birthday is in range - end is birthday', () => {
            // given
            const birthday = DateTime.fromObject({ day: 2, month: 5, year: 1993 })
            const start = DateTime.fromObject({ day: 15, month: 4, year: 2023 })
            const end = DateTime.fromObject({ day: 2, month: 5, year: 2023 })

            // when
            const result = hasBirthdayDuring(birthday, start, end)

            // then
            strictEqual(result, true)
        })

        it('should return false when birthday is not range - day before', () => {
            // given
            const birthday = DateTime.fromObject({ day: 2, month: 5, year: 1993 })
            const start = DateTime.fromObject({ day: 20, month: 4, year: 2023 })
            const end = DateTime.fromObject({ day: 1, month: 5, year: 2023 })

            // when
            const result = hasBirthdayDuring(birthday, start, end)

            // then
            strictEqual(result, false)
        })

        it('should return false when birthday is not range - day after', () => {
            // given
            const birthday = DateTime.fromObject({ day: 2, month: 5, year: 1993 })
            const start = DateTime.fromObject({ day: 3, month: 5, year: 2023 })
            const end = DateTime.fromObject({ day: 20, month: 5, year: 2023 })

            // when
            const result = hasBirthdayDuring(birthday, start, end)

            // then
            strictEqual(result, false)
        })

        it('should return false when birthday is not range - day before and after', () => {
            // given
            const birthday = DateTime.fromObject({ day: 2, month: 5, year: 1993 })
            const start = DateTime.fromObject({ day: 3, month: 5, year: 2023 })
            const end = DateTime.fromObject({ day: 1, month: 5, year: 2024 })

            // when
            const result = hasBirthdayDuring(birthday, start, end)

            // then
            strictEqual(result, false)
        })
    })
})
