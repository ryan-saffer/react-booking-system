import { capitalise, FRANCHISE_STUDIOS, type FranchiseOrMaster, type ShiftUnderMinimumShiftLength } from 'fizz-kidz'
import { DateTime } from 'luxon'

import { SlingClient } from '@/sling/sling-client'
import { MailClient } from '@/sendgrid/MailClient'

import { getShiftsUnderMinimumShiftLengthForTimesheets } from './timesheets/minimum-shift-length-report'
import { getWeeks } from './timesheets/timesheets.utils'

const XERO_STUDIOS: FranchiseOrMaster[] = ['master', ...FRANCHISE_STUDIOS]
const TIMEZONE = 'Australia/Melbourne'

export async function sendMinimumShiftLengthReport() {
    const endDate = DateTime.now().setZone(TIMEZONE).minus({ days: 1 }).startOf('day')
    const startDate = endDate.minus({ days: 13 }).startOf('day')

    const slingClient = new SlingClient()
    const slingUsers = await slingClient.getUsers()
    const weeks = getWeeks(startDate, endDate)

    const reportByStudio = await Promise.all(
        XERO_STUDIOS.map(async (studio) => {
            const shifts: ShiftUnderMinimumShiftLength[] = []
            for (const week of weeks) {
                const allTimesheets = await slingClient.getTimesheets(week.start.toJSDate(), week.end.toJSDate())
                shifts.push(
                    ...getShiftsUnderMinimumShiftLengthForTimesheets({
                        studio,
                        slingUsers,
                        allTimesheets,
                    })
                )
            }

            return {
                studio: studio === 'master' ? 'Head office' : capitalise(studio),
                shifts,
            }
        })
    )

    const studiosWithShifts = reportByStudio.filter((it) => it.shifts.length > 0)
    if (studiosWithShifts.length === 0) return

    const mailClient = await MailClient.getInstance()
    await mailClient.sendEmail('minimumShiftLengthReport', 'people@fizzkidz.com.au', {
        periodLabel: `${startDate.toFormat('d LLL yyyy')} - ${endDate.toFormat('d LLL yyyy')}`,
        studios: studiosWithShifts,
    })
}
