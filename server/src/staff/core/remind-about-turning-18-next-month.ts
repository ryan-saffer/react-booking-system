import { DateTime } from 'luxon'
import { EmployeeStatus } from 'xero-node/dist/gen/model/payroll-au/employeeStatus'

import { capitalise, FRANCHISE_STUDIOS, type FranchiseOrMaster } from 'fizz-kidz'

import { MailClient } from '../../sendgrid/MailClient'
import { XeroClient } from '../../xero/XeroClient'

import type { Employee } from 'xero-node/dist/gen/model/payroll-au/employee'

const XERO_STUDIOS: FranchiseOrMaster[] = ['master', ...FRANCHISE_STUDIOS]
const TIMEZONE = 'Australia/Melbourne'

type EmployeeTurning18 = {
    fullName: string
    studio: FranchiseOrMaster
    birthday: DateTime
}

export async function remindAboutTurning18NextMonth() {
    const nextMonth = DateTime.now().setZone(TIMEZONE).plus({ months: 1 }).startOf('month')
    const employeesTurning18 = await getEmployeesTurning18(nextMonth)

    if (employeesTurning18.length === 0) return

    const month = nextMonth.toFormat('LLLL yyyy')
    const employees = employeesTurning18
        .sort((a, b) => a.birthday.toMillis() - b.birthday.toMillis())
        .map(
            (employee) =>
                `${employee.fullName} (${employee.studio === 'master' ? 'Head office' : capitalise(employee.studio)}) - ${employee.birthday.toFormat('d LLLL yyyy')}`
        )

    const mailClient = await MailClient.getInstance()
    await mailClient.sendEmail('turning18NextMonthReminder', 'people@fizzkidz.com.au', {
        month,
        employees,
    })
}

async function getEmployeesTurning18(targetMonth: DateTime) {
    const employeesByStudio = await Promise.all(
        XERO_STUDIOS.map(async (studio) => {
            const xero = await XeroClient.getInstance(studio)
            const employees = (await xero.payrollAUApi.getEmployees('')).body.employees || []

            return employees
                .map((employee) => getEmployeeTurning18(employee, studio, targetMonth))
                .filter((employee): employee is EmployeeTurning18 => employee !== null)
        })
    )

    return employeesByStudio.flat()
}

function getEmployeeTurning18(
    employee: Employee,
    studio: FranchiseOrMaster,
    targetMonth: DateTime
): EmployeeTurning18 | null {
    if (employee.status === EmployeeStatus.TERMINATED) return null

    const dob = DateTime.fromJSDate(new Date(employee.dateOfBirth)).startOf('day')
    if (!dob.isValid) return null

    const birthday = dob.plus({ years: 18 })
    if (birthday.month !== targetMonth.month || birthday.year !== targetMonth.year) return null

    const fullName = `${employee.firstName} ${employee.lastName}`.trim()
    if (!fullName) return null

    return {
        fullName,
        studio,
        birthday,
    }
}
