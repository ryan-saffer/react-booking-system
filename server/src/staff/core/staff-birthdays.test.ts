import { deepStrictEqual, strictEqual } from 'assert'

import { DateTime } from 'luxon'
import { EmployeeStatus } from 'xero-node/dist/gen/model/payroll-au/employeeStatus'
import { EmploymentBasis } from 'xero-node/dist/gen/model/payroll-au/employmentBasis'

import {
    didTurn18DuringRange,
    getEighteenthBirthday,
    getEmployeesTurning18InMonth,
    getEmployeesWithBirthdayDuringRange,
} from './staff-birthdays'

import type { Employee } from 'xero-node/dist/gen/model/payroll-au/employee'

function createEmployee(overrides: Partial<Employee> = {}): Employee {
    return {
        employeeID: 'employee-1',
        firstName: 'Jamie',
        lastName: 'Smith',
        dateOfBirth: '2008-05-10T14:30:00.000Z',
        status: EmployeeStatus.ACTIVE,
        taxDeclaration: {
            employmentBasis: EmploymentBasis.CASUAL,
        },
        ...overrides,
    } as Employee
}

describe('Staff birthdays', () => {
    describe('getEighteenthBirthday', () => {
        it('should return the eighteenth birthday at the start of the day', () => {
            const dob = DateTime.fromObject({ year: 2008, month: 5, day: 10, hour: 14, minute: 30 })

            const result = getEighteenthBirthday(dob)

            strictEqual(result.toISODate(), '2026-05-10')
            strictEqual(result.hour, 0)
            strictEqual(result.minute, 0)
        })
    })

    describe('didTurn18DuringRange', () => {
        it('should treat the start and end of the range as inclusive', () => {
            const start = DateTime.fromObject({ year: 2026, month: 5, day: 10 }).startOf('day')
            const end = DateTime.fromObject({ year: 2026, month: 5, day: 31 }).endOf('day')

            strictEqual(
                didTurn18DuringRange(
                    DateTime.fromObject({ year: 2008, month: 5, day: 10, hour: 8, minute: 15 }),
                    start,
                    end
                ),
                true
            )
            strictEqual(
                didTurn18DuringRange(
                    DateTime.fromObject({ year: 2008, month: 5, day: 31, hour: 8, minute: 15 }),
                    start,
                    end
                ),
                true
            )
        })

        it('should return false when the eighteenth birthday is outside the range', () => {
            const start = DateTime.fromObject({ year: 2026, month: 5, day: 10 }).startOf('day')
            const end = DateTime.fromObject({ year: 2026, month: 5, day: 31 }).endOf('day')

            strictEqual(
                didTurn18DuringRange(
                    DateTime.fromObject({ year: 2008, month: 6, day: 1, hour: 8, minute: 15 }),
                    start,
                    end
                ),
                false
            )
        })
    })

    describe('getEmployeesWithBirthdayDuringRange', () => {
        it('should return employees whose birthdays fall within the range across calendar years', () => {
            const employees = [
                createEmployee({
                    employeeID: 'employee-1',
                    firstName: 'Ava',
                    lastName: 'Jones',
                    dateOfBirth: '2008-12-28',
                }),
                createEmployee({
                    employeeID: 'employee-2',
                    firstName: 'Noah',
                    lastName: 'Brown',
                    dateOfBirth: '2010-01-02',
                }),
                createEmployee({
                    employeeID: 'employee-3',
                    firstName: 'Mia',
                    lastName: 'Green',
                    dateOfBirth: '2009-01-10',
                }),
                createEmployee({
                    employeeID: 'employee-4',
                    firstName: 'Parker',
                    lastName: 'Fulltime',
                    dateOfBirth: '2008-12-29',
                    taxDeclaration: { employmentBasis: EmploymentBasis.FULLTIME },
                }),
            ]

            const result = getEmployeesWithBirthdayDuringRange({
                employees,
                studio: 'balwyn',
                start: DateTime.fromISO('2025-12-25T00:00:00.000Z'),
                end: DateTime.fromISO('2026-01-03T23:59:59.999Z'),
            })

            strictEqual(result.length, 2)
            deepStrictEqual(
                result.map((employee) => ({
                    employeeId: employee.employeeId,
                    fullName: employee.fullName,
                    studio: employee.studio,
                    dob: employee.dob.toISODate(),
                })),
                [
                    {
                        employeeId: 'employee-1',
                        fullName: 'Ava Jones',
                        studio: 'balwyn',
                        dob: '2008-12-28',
                    },
                    {
                        employeeId: 'employee-2',
                        fullName: 'Noah Brown',
                        studio: 'balwyn',
                        dob: '2010-01-02',
                    },
                ]
            )
        })

        it('should filter out employees that cannot be parsed before checking birthdays', () => {
            const result = getEmployeesWithBirthdayDuringRange({
                employees: [
                    createEmployee({
                        employeeID: 'valid-employee',
                        firstName: 'Valid',
                        lastName: 'Person',
                        dateOfBirth: '2008-05-15',
                    }),
                    createEmployee({
                        employeeID: undefined,
                        firstName: 'Missing',
                        lastName: 'Id',
                        dateOfBirth: '2008-05-15',
                    }),
                    createEmployee({
                        employeeID: 'terminated-employee',
                        status: EmployeeStatus.TERMINATED,
                        dateOfBirth: '2008-05-15',
                    }),
                    createEmployee({ employeeID: 'invalid-dob', dateOfBirth: 'not-a-date' }),
                    createEmployee({ employeeID: 'blank-name', firstName: ' ', lastName: ' ' }),
                    createEmployee({
                        employeeID: 'part-time-employee',
                        firstName: 'Part',
                        lastName: 'Timer',
                        dateOfBirth: '2008-05-15',
                        taxDeclaration: { employmentBasis: EmploymentBasis.PARTTIME },
                    }),
                    createEmployee({
                        employeeID: 'missing-basis',
                        firstName: 'No',
                        lastName: 'Basis',
                        dateOfBirth: '2008-05-15',
                        taxDeclaration: undefined,
                    }),
                ],
                studio: 'master',
                start: DateTime.fromISO('2026-05-01T00:00:00.000Z'),
                end: DateTime.fromISO('2026-05-31T23:59:59.999Z'),
            })

            strictEqual(result.length, 1)
            strictEqual(result[0].employeeId, 'valid-employee')
            strictEqual(result[0].fullName, 'Valid Person')
            strictEqual(result[0].studio, 'master')
        })
    })

    describe('getEmployeesTurning18InMonth', () => {
        it('should return employees turning 18 in the target month with their eighteenth birthday', () => {
            const result = getEmployeesTurning18InMonth({
                employees: [
                    createEmployee({
                        employeeID: 'turning-18-start',
                        firstName: 'Alex',
                        lastName: 'Start',
                        dateOfBirth: '2008-05-01',
                    }),
                    createEmployee({
                        employeeID: 'turning-18-end',
                        firstName: 'Blake',
                        lastName: 'End',
                        dateOfBirth: '2008-05-31',
                    }),
                    createEmployee({
                        employeeID: 'wrong-month',
                        firstName: 'Casey',
                        lastName: 'June',
                        dateOfBirth: '2008-06-01',
                    }),
                    createEmployee({
                        employeeID: 'terminated',
                        firstName: 'Dana',
                        lastName: 'Terminated',
                        dateOfBirth: '2008-05-20',
                        status: EmployeeStatus.TERMINATED,
                    }),
                    createEmployee({
                        employeeID: 'full-time',
                        firstName: 'Frankie',
                        lastName: 'Fulltime',
                        dateOfBirth: '2008-05-20',
                        taxDeclaration: { employmentBasis: EmploymentBasis.FULLTIME },
                    }),
                    createEmployee({
                        employeeID: 'part-time',
                        firstName: 'Pat',
                        lastName: 'Parttime',
                        dateOfBirth: '2008-05-21',
                        taxDeclaration: { employmentBasis: EmploymentBasis.PARTTIME },
                    }),
                    createEmployee({
                        employeeID: 'missing-basis',
                        firstName: 'Morgan',
                        lastName: 'NoBasis',
                        dateOfBirth: '2008-05-22',
                        taxDeclaration: undefined,
                    }),
                ],
                studio: 'kingsville',
                targetMonth: DateTime.fromISO('2026-05-15T12:00:00.000Z'),
            })

            deepStrictEqual(
                result.map((employee) => ({
                    employeeId: employee.employeeId,
                    fullName: employee.fullName,
                    studio: employee.studio,
                    birthday: employee.birthday.toISODate(),
                })),
                [
                    {
                        employeeId: 'turning-18-start',
                        fullName: 'Alex Start',
                        studio: 'kingsville',
                        birthday: '2026-05-01',
                    },
                    {
                        employeeId: 'turning-18-end',
                        fullName: 'Blake End',
                        studio: 'kingsville',
                        birthday: '2026-05-31',
                    },
                ]
            )
        })
    })
})
