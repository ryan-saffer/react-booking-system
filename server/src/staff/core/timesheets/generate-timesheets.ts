import fs from 'fs'
import os from 'os'
import path from 'path'

import { logger } from 'firebase-functions/v2'
import { GenerateTimesheetsParams } from 'fizz-kidz'
import { DateTime } from 'luxon'
import type { Employee } from 'xero-node/dist/gen/model/payroll-au/employee'

import { StorageClient } from '../../../firebase/StorageClient'
import { projectId } from '../../../init'
import { SlingClient } from '../../../sling/sling-client'
import { throwTrpcError } from '../../../utilities'
import { XeroClient } from '../../../xero/XeroClient'
import { Rate } from './timesheets.types'
import { TimesheetRow, createTimesheetRows, getWeeks, hasBirthdayDuring, isYoungerThan18 } from './timesheets.utils'

const BONNIE_OVERTIME_START = 30
const OVERTIME_START = 38

type XeroUserCache = { [key: string]: Employee | undefined }

export async function generateTimesheets({ startDateInput, endDateInput }: GenerateTimesheetsParams) {
    const slingClient = new SlingClient()

    // ensure dates start and end at midnight
    const startDate = DateTime.fromFormat(startDateInput, 'dd/MM/yyyy').set({
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
    })
    const endDate = DateTime.fromFormat(endDateInput, 'dd/MM/yyyy').set({
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
    })

    // validate data
    if (startDate > endDate) {
        throwTrpcError('BAD_REQUEST', 'start date must come before the end date', {
            errorCode: 'invalid-range',
        })
    }

    const diffInDays = endDate.diff(startDate, 'days').days
    if (diffInDays > 28) {
        throwTrpcError('BAD_REQUEST', 'date range must be 28 days or less', {
            errorCode: 'invalid-length',
        })
    }

    const ORDINARY_PAY_EARNINGS_RATE_ID = '1ef5805a-5208-4d89-8f35-620104543ed4'

    try {
        // break the time period into weeks
        const weeks = getWeeks(startDate, endDate)

        // get all sling users
        const slingUsers = await slingClient.getUsers()

        // cache for xero users
        const xeroUsersCache: XeroUserCache = {}

        const xero = await XeroClient.getInstance()

        const xeroUsers = (await xero.payrollAUApi.getEmployees('')).body.employees

        // to keep track of all rows
        let rows: TimesheetRow[] = []

        // keeps track of users who couldnt be found in xero
        const skippedUsers: string[] = []

        // keeps track of users who have a birthday during the pay period
        const employeesWithBirthday: string[] = []

        // leeps track of users who are under 18, but worked for more than 30 hrs in a single week (in order to be paid super)
        const employeesUnder18Over30Hrs: string[] = []

        // calculate timesheets one week at a time
        for (const week of weeks) {
            // get all shifts for the time period
            const allTimesheets = await slingClient.getTimesheets(week.start.toJSDate(), week.end.toJSDate())
            const timesheets = allTimesheets.filter((it) => it.status === 'published')

            // for each user, get all their timesheets
            for (const slingUser of slingUsers) {
                const usersTimesheets = timesheets.filter((it) => it.user.id === slingUser.id)
                if (usersTimesheets.length === 0) continue

                let xeroUser = xeroUsers?.find((user) => user.employeeID === slingUser.employeeId)
                if (!xeroUser) {
                    logger.log(`unable to find sling user in Xero: ${slingUser.legalName} ${slingUser.lastname}`)
                    skippedUsers.push(`${slingUser.legalName} ${slingUser.lastname}`)
                    continue
                }

                // calculate if the user has a birthday during this fortnight
                const dob = DateTime.fromJSDate(new Date(xeroUser.dateOfBirth))
                const hasBirthdayDuringPayrun = hasBirthdayDuring(dob, startDate, endDate)
                if (hasBirthdayDuringPayrun) {
                    employeesWithBirthday.push(
                        `${xeroUser.firstName} ${xeroUser.lastName} - ${dob.toLocaleString(DateTime.DATE_SHORT)}`
                    )
                }

                // if the employee is under 18, fetch their pay template.
                // this will help determine if they are already above the minimum $18/hr rate.
                // only fetch under 18 year olds because this call is expensive.
                let rate: Rate = 'not required'
                if (isYoungerThan18(dob)) {
                    xeroUser = await getAndCacheXeroUser(slingUser.employeeId, xeroUsersCache)
                    const ordinaryRate = xeroUser.payTemplate?.earningsLines?.find(
                        (line) => line.earningsRateID === ORDINARY_PAY_EARNINGS_RATE_ID
                    )?.ratePerUnit
                    if (!ordinaryRate) {
                        logger.log(
                            `unable to find ordinary earnings rate in Xero for user: ${slingUser.legalName} ${slingUser.lastname}`
                        )
                        skippedUsers.push(`${slingUser.legalName} ${slingUser.lastname}`)
                        continue
                    }
                    rate = ordinaryRate
                }

                const BONNIE_ID = '1551679a-9e81-47d3-b019-906d7ce617f1'
                const partTimeEmployees = [
                    BONNIE_ID,
                    'fa53fa93-ed63-4d20-bf99-e0996700044a', // ebony perkins
                ]
                const isCasual = !partTimeEmployees.includes(slingUser.employeeId)

                const { rows: employeesRows, totalHours } = createTimesheetRows({
                    firstName: xeroUser.firstName,
                    lastName: xeroUser.lastName,
                    dob,
                    hasBirthdayDuringPayrun,
                    isCasual,
                    overtimeThreshold: slingUser.employeeId === BONNIE_ID ? BONNIE_OVERTIME_START : OVERTIME_START,
                    usersTimesheets,
                    rate,
                    timezone: slingUser.timezone,
                })

                if (isYoungerThan18(dob) && totalHours > 30) {
                    employeesUnder18Over30Hrs.push(`${xeroUser.firstName} ${xeroUser.lastName}`)
                }

                rows = [...rows, ...employeesRows]
            }
        }

        // create the csv
        const filename = `${startDate.toLocaleString(DateTime.DATE_SHORT)}:${endDate.toLocaleString(
            DateTime.DATE_SHORT
        )}.csv`
            .split('/')
            .join('-')
        const tempFilePath = path.join(os.tmpdir(), filename)

        fs.writeFileSync(tempFilePath, 'first_name,last_name,type,date,hours,notes\n')
        rows.map((row) =>
            fs.appendFileSync(
                tempFilePath,
                `${row.firstName},${row.lastname},${row.payItem},${row.date.toLocaleString(DateTime.DATE_SHORT)},${
                    row.hours
                },${row.summary.replace(/[\r\n]+/gm, '')}\n`
            )
        )

        const storage = await StorageClient.getInstance()

        const [file] = await storage
            .bucket(`${projectId}.appspot.com`)
            .upload(tempFilePath, { destination: `payroll/${filename}` })

        const url = await file.getSignedUrl({
            action: 'read',
            expires: DateTime.now().plus({ days: 7 }).toISODate(),
        })
        const downloadUrl = url[0]

        // remove duplicate skipped users
        return {
            url: downloadUrl,
            skippedEmployees: [...new Set(skippedUsers)],
            employeesWithBirthday: [...new Set(employeesWithBirthday)],
            employeesUnder18Over30Hrs: [...new Set(employeesUnder18Over30Hrs)],
        }
    } catch (err) {
        throwTrpcError('INTERNAL_SERVER_ERROR', 'error generating timesheets', err)
    }
}

async function getAndCacheXeroUser(userId: string, cache: XeroUserCache) {
    const cachedUser = cache[userId]
    if (cachedUser) return cachedUser

    const xero = await XeroClient.getInstance()
    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
    const employee = (await xero.payrollAUApi.getEmployee('', userId)).body.employees?.[0]!
    cache[userId] = employee
    return employee
}
