import { DateTime } from 'luxon'

import {
    capitalise,
    FRANCHISE_STUDIOS,
    getStudioContactEmail,
    type FranchiseOrMaster,
    type ShiftUnderMinimumShiftLength,
} from 'fizz-kidz'

import { env } from '@/init'
import { MailClient } from '@/sendgrid/MailClient'
import { SlingClient } from '@/sling/sling-client'

import { getShiftsUnderMinimumShiftLengthForTimesheets } from './timesheets/minimum-shift-length-report'
import { getWeeks } from './timesheets/timesheets.utils'

const XERO_STUDIOS: FranchiseOrMaster[] = ['master', ...FRANCHISE_STUDIOS]
const TIMEZONE = 'Australia/Melbourne'

export async function sendMinimumShiftLengthReport({
    startDate: customStartDate,
    endDate: customEndDate,
}: {
    startDate?: Date
    endDate?: Date
} = {}) {
    const endDate = customEndDate
        ? DateTime.fromJSDate(customEndDate).setZone(TIMEZONE).startOf('day')
        : DateTime.now().setZone(TIMEZONE).minus({ days: 1 }).startOf('day')
    const startDate = customStartDate
        ? DateTime.fromJSDate(customStartDate).setZone(TIMEZONE).startOf('day')
        : endDate.minus({ days: 13 }).startOf('day')

    if (startDate > endDate) {
        throw new Error('Minimum shift length report start date must be on or before the end date')
    }

    const slingClient = new SlingClient()
    const slingUsers = await slingClient.getUsers()
    const weeks = getWeeks(startDate, endDate)

    const reportByStudio = await Promise.all(
        XERO_STUDIOS.map(async (studio) => {
            const shifts: ShiftUnderMinimumShiftLength[] = []
            for (const week of weeks) {
                const allTimesheets = await slingClient.getTimesheets(
                    week.start.startOf('day').toJSDate(),
                    week.end.endOf('day').toJSDate()
                )
                shifts.push(
                    ...getShiftsUnderMinimumShiftLengthForTimesheets({
                        studio,
                        slingUsers,
                        allTimesheets,
                    })
                )
            }
            const recipient =
                env === 'prod'
                    ? studio === 'master'
                        ? 'kym@fizzkidz.com.au'
                        : getStudioContactEmail(studio)
                    : 'ryan@fizzkidz.com.au'

            return {
                recipient,
                studio: studio === 'master' ? 'Corporate Studios' : capitalise(studio),
                shifts,
            }
        })
    )

    const studiosWithShifts = reportByStudio.filter((it) => it.shifts.length > 0)
    if (studiosWithShifts.length === 0) return

    const mailClient = await MailClient.getInstance()
    const periodLabel = `${startDate.toFormat('d LLL yyyy')} - ${endDate.toFormat('d LLL yyyy')}`

    await Promise.all(
        studiosWithShifts.map((report) =>
            mailClient.sendEmail(
                'minimumShiftLengthReport',
                report.recipient,
                {
                    periodLabel,
                    studios: [{ studio: report.studio, shifts: report.shifts }],
                },
                {
                    subject: `Minimum shift length report - ${report.studio}`,
                    bccBookings: false,
                }
            )
        )
    )
}
