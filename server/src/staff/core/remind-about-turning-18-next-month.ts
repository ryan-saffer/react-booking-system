import { DateTime } from 'luxon'

import { capitalise, FRANCHISE_STUDIOS, type FranchiseOrMaster } from 'fizz-kidz'

import { getEmployeesTurning18InMonth } from './staff-birthdays'
import { MailClient } from '../../sendgrid/MailClient'
import { XeroClient } from '../../xero/XeroClient'

const XERO_STUDIOS: FranchiseOrMaster[] = ['master', ...FRANCHISE_STUDIOS]
const TIMEZONE = 'Australia/Melbourne'

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

            return getEmployeesTurning18InMonth({
                employees,
                studio,
                targetMonth,
            })
        })
    )

    return employeesByStudio.flat()
}
