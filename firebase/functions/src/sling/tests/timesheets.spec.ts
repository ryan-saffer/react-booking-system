import { strictEqual } from 'assert'
import { DateTime } from 'luxon'
import { Employee } from 'xero-node/dist/gen/model/payroll-au/employee'
import { Timesheet } from '../core/types'
import { Position, TimesheetRow, Location, createTimesheetRows } from '../core/timesheets'

const olderThan18 = DateTime.fromObject({ year: 2000, day: 30, month: 5 })
const youngerThan18 = DateTime.fromObject({ year: 2015, day: 1, month: 1 })

describe('Timesheet suite', () => {
    describe('TimesheetRow maps to correct pay item', () => {
        it('should map on call for all locations mon-sat - over 18', () => {
            // balwyn
            let row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                position: Position.ON_CALL,
                location: Location.BALWYN,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'ON CALL - Cas Ord Hrs - Mon to Sat - Balwyn')

            // cheltenham
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                position: Position.ON_CALL,
                location: Location.CHELTENHAM,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'ON CALL - Cas Ord Hrs - Mon to Sat - Chelt')

            // essendon
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                position: Position.ON_CALL,
                location: Location.ESSENDON,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'ON CALL - Cas Ord Hrs - Mon to Sat - Essen')

            // malvern
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                position: Position.ON_CALL,
                location: Location.MALVERN,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'ON CALL - Cas Ord Hrs - Mon to Sat - Malv')

            // mobile
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                position: Position.ON_CALL,
                location: Location.MOBILE,
                hours: 8,
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
                position: Position.ON_CALL,
                location: Location.BALWYN,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'On call - 16&17yo Csl Or Hs - Mon to Sat - Balwyn')

            // cheltenham
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                position: Position.ON_CALL,
                location: Location.CHELTENHAM,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'On call - 16&17yo Csl Or Hs - Mon to Sat - Chelt')

            // essendon
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                position: Position.ON_CALL,
                location: Location.ESSENDON,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'On call - 16&17yo Csl Or Hs - Mon to Sat - Essen')

            // malvern
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                position: Position.ON_CALL,
                location: Location.MALVERN,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'On call - 16&17yo Csl Or Hs - Mon to Sat - Malvern')

            // mobile
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: youngerThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                position: Position.ON_CALL,
                location: Location.MOBILE,
                hours: 8,
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
                position: Position.ON_CALL,
                location: Location.BALWYN,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'ON CALL - Cas Ord Hrs - Sunday - Balwyn')

            // cheltenham
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                position: Position.ON_CALL,
                location: Location.CHELTENHAM,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'ON CALL - Cas Ord Hrs - Sunday - Chelt')

            // essendon
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                position: Position.ON_CALL,
                location: Location.ESSENDON,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'ON CALL - Cas Ord Hrs - Sunday - Essend')

            // malvern
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                position: Position.ON_CALL,
                location: Location.MALVERN,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'ON CALL - Cas Ord Hrs - Sunday - Malvern')

            // mobile
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                position: Position.ON_CALL,
                location: Location.MOBILE,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'ON CALL - Cas Ord Hrs - Sunday - Mobile')
        })

        it('should map called in party facilitator for all locations mon-sat', () => {
            // balwyn
            let row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 2, month: 5, year: 2023 }), // tuesday
                position: Position.CALLED_IN_PARTY_FACILITATOR,
                location: Location.BALWYN,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - Cas Ord Hrs - Mon to Sat - Balwyn')

            // cheltenham
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 2, month: 5, year: 2023 }), // tuesday
                position: Position.CALLED_IN_PARTY_FACILITATOR,
                location: Location.CHELTENHAM,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - Cas Ord Hrs - Mon to Sat - Chelt')

            // essendon
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 2, month: 5, year: 2023 }), // tuesday
                position: Position.CALLED_IN_PARTY_FACILITATOR,
                location: Location.ESSENDON,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - Cas Ord Hrs - Mon to Sat - Essen')

            // malvern
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 2, month: 5, year: 2023 }), // tuesday
                position: Position.CALLED_IN_PARTY_FACILITATOR,
                location: Location.MALVERN,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - Cas Ord Hrs - Mon to Sat - Malvern')

            // mobile
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 2, month: 5, year: 2023 }), // tuesday
                position: Position.CALLED_IN_PARTY_FACILITATOR,
                location: Location.MOBILE,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - Cas Ord Hrs - Mon to Sat - Mobile')
        })

        it('should map called in holiday program facilitator for all locations mon-sat', () => {
            // balwyn
            let row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 2, month: 5, year: 2023 }), // tuesday
                position: Position.CALLED_IN_HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.BALWYN,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - Cas Ord Hrs - Mon to Sat - Balwyn')

            // cheltenham
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 2, month: 5, year: 2023 }), // tuesday
                position: Position.CALLED_IN_HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.CHELTENHAM,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - Cas Ord Hrs - Mon to Sat - Chelt')

            // essendon
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 2, month: 5, year: 2023 }), // tuesday
                position: Position.CALLED_IN_HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.ESSENDON,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - Cas Ord Hrs - Mon to Sat - Essen')

            // malvern
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 2, month: 5, year: 2023 }), // tuesday
                position: Position.CALLED_IN_HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.MALVERN,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - Cas Ord Hrs - Mon to Sat - Malvern')

            // mobile
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 2, month: 5, year: 2023 }), // tuesday
                position: Position.CALLED_IN_HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.MOBILE,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - Cas Ord Hrs - Mon to Sat - Mobile')
        })

        it('should map called in party facilitator for all locations sunday', () => {
            // balwyn
            let row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                position: Position.CALLED_IN_PARTY_FACILITATOR,
                location: Location.BALWYN,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - Cas Ord Hrs - Sun - Balwyn')

            // cheltenham
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                position: Position.CALLED_IN_PARTY_FACILITATOR,
                location: Location.CHELTENHAM,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - Cas Ord Hrs - Sun - Chelt')

            // essendon
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                position: Position.CALLED_IN_PARTY_FACILITATOR,
                location: Location.ESSENDON,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - Cas Ord Hrs - Sun - Essend')

            // malvern
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                position: Position.CALLED_IN_PARTY_FACILITATOR,
                location: Location.MALVERN,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - Cas Ord Hrs - Sun - Malvern')

            // mobile
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                position: Position.CALLED_IN_PARTY_FACILITATOR,
                location: Location.MOBILE,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - Cas Ord Hrs - Sun - Mobile')
        })

        it('should map called in holiday program facilitator for all locations sunday', () => {
            // balwyn
            let row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                position: Position.CALLED_IN_HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.BALWYN,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - Cas Ord Hrs - Sun - Balwyn')

            // cheltenham
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                position: Position.CALLED_IN_HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.CHELTENHAM,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - Cas Ord Hrs - Sun - Chelt')

            // essendon
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                position: Position.CALLED_IN_HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.ESSENDON,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - Cas Ord Hrs - Sun - Essend')

            // malvern
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                position: Position.CALLED_IN_HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.MALVERN,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - Cas Ord Hrs - Sun - Malvern')

            // mobile
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                position: Position.CALLED_IN_HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.MOBILE,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'CALLEDIN - Cas Ord Hrs - Sun - Mobile')
        })

        it('should map party faciliator for all locations mon-sat', () => {
            // balwyn
            let row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                position: Position.PARTY_FACILITATOR,
                location: Location.BALWYN,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Mon to Sat - Balwyn')

            // cheltenham
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                position: Position.PARTY_FACILITATOR,
                location: Location.CHELTENHAM,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Mon to Sat - Chelt')

            // essendon
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                position: Position.PARTY_FACILITATOR,
                location: Location.ESSENDON,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Mon to Sat - Essendon')

            // malvern
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                position: Position.PARTY_FACILITATOR,
                location: Location.MALVERN,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Mon to Sat - Malvern')

            // mobile
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                position: Position.PARTY_FACILITATOR,
                location: Location.MOBILE,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Mon to Sat - Mobile')
        })

        it('should map party faciliator for all locations sunday', () => {
            // balwyn
            let row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                position: Position.PARTY_FACILITATOR,
                location: Location.BALWYN,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Balwyn')

            // cheltenham
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                position: Position.PARTY_FACILITATOR,
                location: Location.CHELTENHAM,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Chelt')

            // essendon
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                position: Position.PARTY_FACILITATOR,
                location: Location.ESSENDON,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Essendon')

            // malvern
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                position: Position.PARTY_FACILITATOR,
                location: Location.MALVERN,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Malvern')

            // mobile
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                position: Position.PARTY_FACILITATOR,
                location: Location.MOBILE,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Mobile')
        })

        it('should map holiday program faciliator for all locations mon-sat', () => {
            // balwyn
            let row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                position: Position.HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.BALWYN,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Mon to Sat - Balwyn')

            // cheltenham
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                position: Position.HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.CHELTENHAM,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Mon to Sat - Chelt')

            // essendon
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                position: Position.HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.ESSENDON,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Mon to Sat - Essendon')

            // malvern
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                position: Position.HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.MALVERN,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Mon to Sat - Malvern')

            // mobile
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                position: Position.HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.MOBILE,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Mon to Sat - Mobile')
        })

        it('should map holiday program faciliator for all locations sunday', () => {
            // balwyn
            let row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                position: Position.HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.BALWYN,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Balwyn')

            // cheltenham
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                position: Position.HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.CHELTENHAM,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Chelt')

            // essendon
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                position: Position.HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.ESSENDON,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Essendon')

            // malvern
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                position: Position.HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.MALVERN,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Malvern')

            // mobile
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                position: Position.HOLIDAY_PROGRAM_FACILITATOR,
                location: Location.MOBILE,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Mobile')
        })

        it('should map science club facilitator for all locations mon-sat', () => {
            // balwyn
            let row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                position: Position.SCIENCE_CLUB_FACILITATOR,
                location: Location.BALWYN,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Mon to Sat - Balwyn')

            // cheltenham
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                position: Position.SCIENCE_CLUB_FACILITATOR,
                location: Location.CHELTENHAM,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Mon to Sat - Chelt')

            // essendon
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                position: Position.SCIENCE_CLUB_FACILITATOR,
                location: Location.ESSENDON,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Mon to Sat - Essendon')

            // malvern
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                position: Position.SCIENCE_CLUB_FACILITATOR,
                location: Location.MALVERN,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Mon to Sat - Malvern')

            // mobile
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                position: Position.SCIENCE_CLUB_FACILITATOR,
                location: Location.MOBILE,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Mon to Sat - Mobile')
        })

        it('should map science club faciliator for all locations sunday', () => {
            // balwyn
            let row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                position: Position.SCIENCE_CLUB_FACILITATOR,
                location: Location.BALWYN,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Balwyn')

            // cheltenham
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                position: Position.SCIENCE_CLUB_FACILITATOR,
                location: Location.CHELTENHAM,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Chelt')

            // essendon
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                position: Position.SCIENCE_CLUB_FACILITATOR,
                location: Location.ESSENDON,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Essendon')

            // malvern
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                position: Position.SCIENCE_CLUB_FACILITATOR,
                location: Location.MALVERN,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Malvern')

            // mobile
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                position: Position.SCIENCE_CLUB_FACILITATOR,
                location: Location.MOBILE,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Mobile')
        })

        it('should map miscellaneous position for all locations mon-sat', () => {
            // balwyn
            let row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                position: Position.MISCELLANEOUS,
                location: Location.BALWYN,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Mon to Sat - Balwyn')

            // cheltenham
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                position: Position.MISCELLANEOUS,
                location: Location.CHELTENHAM,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Mon to Sat - Chelt')

            // essendon
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                position: Position.MISCELLANEOUS,
                location: Location.ESSENDON,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Mon to Sat - Essendon')

            // malvern
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                position: Position.MISCELLANEOUS,
                location: Location.MALVERN,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Mon to Sat - Malvern')

            // mobile
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 1, month: 5, year: 2023 }), // monday
                position: Position.MISCELLANEOUS,
                location: Location.MOBILE,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Mon to Sat - Mobile')
        })

        it('should map miscellaneous position for all locations sunday', () => {
            // balwyn
            let row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                position: Position.MISCELLANEOUS,
                location: Location.BALWYN,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Balwyn')

            // cheltenham
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                position: Position.MISCELLANEOUS,
                location: Location.CHELTENHAM,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Chelt')

            // essendon
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                position: Position.MISCELLANEOUS,
                location: Location.ESSENDON,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Essendon')

            // malvern
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                position: Position.MISCELLANEOUS,
                location: Location.MALVERN,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Malvern')

            // mobile
            row = new TimesheetRow({
                firstName: 'Ryan',
                lastName: 'Saffer',
                dob: olderThan18,
                date: DateTime.fromObject({ day: 7, month: 5, year: 2023 }), // sunday
                position: Position.MISCELLANEOUS,
                location: Location.MOBILE,
                hours: 8,
                overtime: { firstThreeHours: false, afterThreeHours: false },
            })
            strictEqual(row.payItem, 'Casual Ordinary Hours - Sunday - Mobile')
        })
    })

    describe('creating timesheet rows', () => {
        const xeroUser: Employee = {
            firstName: 'Ryan',
            lastName: 'Saffer',
            dateOfBirth: DateTime.fromObject({ day: 2, month: 5, year: 1993 }).toISO(),
        }
        it('should not reach overtime - 30 hours', () => {
            // given
            const timesheets: Timesheet[] = [
                {
                    dtstart: '2023-05-01T10:00:00+10:00',
                    dtend: '2023-05-01T20:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                },
                {
                    dtstart: '2023-05-02T10:00:00+10:00',
                    dtend: '2023-05-02T20:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                },
                {
                    dtstart: '2023-05-03T10:00:00+10:00',
                    dtend: '2023-05-03T20:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                },
            ]

            // when
            const result = createTimesheetRows(
                xeroUser.firstName,
                xeroUser.lastName,
                DateTime.fromISO(xeroUser.dateOfBirth),
                timesheets,
                'Australia/Melbourne'
            )

            // then
            strictEqual(result.length, 3)

            strictEqual(result[0].payItem, 'Casual Ordinary Hours - Mon to Sat - Balwyn')
            strictEqual(result[0].hours, 10)

            strictEqual(result[1].payItem, 'Casual Ordinary Hours - Mon to Sat - Balwyn')
            strictEqual(result[1].hours, 10)

            strictEqual(result[2].payItem, 'Casual Ordinary Hours - Mon to Sat - Balwyn')
            strictEqual(result[2].hours, 10)
        })

        it('should reach overtime - 40 hours - first overtime shift over 3 hours', () => {
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
                },
                {
                    // 10 hours
                    dtstart: '2023-05-02T10:00:00+10:00',
                    dtend: '2023-05-02T20:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                },
                {
                    // 8 hours
                    dtstart: '2023-05-03T10:00:00+10:00',
                    dtend: '2023-05-03T18:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                },
                {
                    // 7 hours (first 2 should okay, then next 5 overtime. first three should be under three hours, then last 2 over three hours)
                    dtstart: '2023-05-04T10:00:00+10:00',
                    dtend: '2023-05-04T17:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                },
                {
                    // 5 hours
                    dtstart: '2023-05-05T10:00:00+10:00',
                    dtend: '2023-05-05T15:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                },
            ]

            // when
            const result = createTimesheetRows(
                xeroUser.firstName,
                xeroUser.lastName,
                DateTime.fromISO(xeroUser.dateOfBirth),
                timesheets,
                'Australia/Melbourne'
            )

            // then
            strictEqual(result.length, 7)

            strictEqual(result[0].payItem, 'Casual Ordinary Hours - Mon to Sat - Balwyn')
            strictEqual(result[0].hours, 10)

            strictEqual(result[1].payItem, 'Casual Ordinary Hours - Mon to Sat - Balwyn')
            strictEqual(result[1].hours, 10)

            strictEqual(result[2].payItem, 'Casual Ordinary Hours - Mon to Sat - Balwyn')
            strictEqual(result[2].hours, 8)

            strictEqual(result[3].payItem, 'Casual Ordinary Hours - Mon to Sat - Balwyn')
            strictEqual(result[3].hours, 2)

            strictEqual(result[4].payItem, 'TODO - OVERTIME - FIRST THREE HOURS - BALWYN')
            strictEqual(result[4].hours, 3)

            strictEqual(result[5].payItem, 'TODO - OVERTIME - AFTER THREE HOURS - BALWYN')
            strictEqual(result[5].hours, 2)

            strictEqual(result[6].payItem, 'TODO - OVERTIME - AFTER THREE HOURS - BALWYN')
            strictEqual(result[6].hours, 5)
        })

        it('should reach overtime - 40 hours - first overtime shift under 3 hours', () => {
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
                },
                {
                    // 10 hours
                    dtstart: '2023-05-02T10:00:00+10:00',
                    dtend: '2023-05-02T20:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                },
                {
                    // 8 hours
                    dtstart: '2023-05-03T10:00:00+10:00',
                    dtend: '2023-05-03T18:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                },
                {
                    // 4 hours (first 2 should okay, then next 2 overtime, under three hours.)
                    dtstart: '2023-05-04T10:00:00+10:00',
                    dtend: '2023-05-04T14:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                },
                {
                    // 5 hours (first hour under three hours overtime, next 4 over three hours)
                    dtstart: '2023-05-05T10:00:00+10:00',
                    dtend: '2023-05-05T15:00:00+10:00',
                    location: { id: 4809521 }, // balwyn
                    position: { id: 4809533 }, // party facilitator
                    user: { id: 123 },
                    status: 'published',
                },
            ]

            // when
            const result = createTimesheetRows(
                xeroUser.firstName,
                xeroUser.lastName,
                DateTime.fromISO(xeroUser.dateOfBirth),
                timesheets,
                'Australia/Melbourne'
            )

            // then
            strictEqual(result.length, 7)

            strictEqual(result[0].payItem, 'Casual Ordinary Hours - Mon to Sat - Balwyn')
            strictEqual(result[0].hours, 10)

            strictEqual(result[1].payItem, 'Casual Ordinary Hours - Mon to Sat - Balwyn')
            strictEqual(result[1].hours, 10)

            strictEqual(result[2].payItem, 'Casual Ordinary Hours - Mon to Sat - Balwyn')
            strictEqual(result[2].hours, 8)

            strictEqual(result[3].payItem, 'Casual Ordinary Hours - Mon to Sat - Balwyn')
            strictEqual(result[3].hours, 2)

            strictEqual(result[4].payItem, 'TODO - OVERTIME - FIRST THREE HOURS - BALWYN')
            strictEqual(result[4].hours, 2)

            strictEqual(result[5].payItem, 'TODO - OVERTIME - FIRST THREE HOURS - BALWYN')
            strictEqual(result[5].hours, 1)

            strictEqual(result[6].payItem, 'TODO - OVERTIME - AFTER THREE HOURS - BALWYN')
            strictEqual(result[6].hours, 4)
        })
    })
})
