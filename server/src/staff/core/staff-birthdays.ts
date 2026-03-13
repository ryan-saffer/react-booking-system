import { DateTime } from 'luxon'
import { EmployeeStatus } from 'xero-node/dist/gen/model/payroll-au/employeeStatus'

import { isNotNull, type FranchiseOrMaster } from 'fizz-kidz'

import type { Employee } from 'xero-node/dist/gen/model/payroll-au/employee'

export type EmployeeBirthday = {
    employeeId: string
    fullName: string
    dob: DateTime
    studio: FranchiseOrMaster
}

export function getEmployeesWithBirthdayDuringRange({
    employees,
    studio,
    start,
    end,
}: {
    employees: Employee[]
    studio: FranchiseOrMaster
    start: DateTime
    end: DateTime
}) {
    return employees
        .map((employee) => parseEmployeeBirthday(employee, studio))
        .filter(isNotNull)
        .filter(({ dob }) => hasBirthdayDuring(dob, start, end))
}

export function getEmployeesTurning18InMonth({
    employees,
    studio,
    targetMonth,
}: {
    employees: Employee[]
    studio: FranchiseOrMaster
    targetMonth: DateTime
}) {
    const start = targetMonth.startOf('month')
    const end = targetMonth.endOf('month')

    return employees
        .map((employee) => parseEmployeeBirthday(employee, studio))
        .filter(isNotNull)
        .filter(({ dob }) => didTurn18DuringRange(dob, start, end))
        .map(({ employeeId, fullName, studio: employeeStudio, dob }) => ({
            employeeId,
            fullName,
            studio: employeeStudio,
            birthday: getEighteenthBirthday(dob),
        }))
}

export function getEighteenthBirthday(dob: DateTime) {
    return dob.plus({ years: 18 }).startOf('day')
}

export function didTurn18DuringRange(dob: DateTime, start: DateTime, end: DateTime) {
    const eighteenthBirthday = getEighteenthBirthday(dob)
    return start <= eighteenthBirthday && eighteenthBirthday <= end
}

function parseEmployeeBirthday(employee: Employee, studio: FranchiseOrMaster): EmployeeBirthday | null {
    if (!employee.employeeID) return null
    if (employee.status === EmployeeStatus.TERMINATED) return null

    const dob = DateTime.fromJSDate(new Date(employee.dateOfBirth)).startOf('day')
    if (!dob.isValid) return null

    const fullName = `${employee.firstName} ${employee.lastName}`.trim()
    if (!fullName) return null

    return {
        employeeId: employee.employeeID,
        fullName,
        dob,
        studio,
    }
}

function hasBirthdayDuring(dob: DateTime, start: DateTime, end: DateTime) {
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
