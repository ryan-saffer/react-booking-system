import fs from 'fs'
import os from 'os'
import path from 'path'

import { logger } from 'firebase-functions/v2'
import { isFranchise, type FranchiseOrMaster, type GenerateTimesheetsParams } from 'fizz-kidz'
import { DateTime } from 'luxon'
import type { Employee } from 'xero-node/dist/gen/model/payroll-au/employee'

import type { Rate } from './timesheets.types'
import type { TimesheetRow } from './timesheets.utils'
import {
    createTimesheetRows,
    getWeeks,
    hasBirthdayDuring,
    isYoungerThan18,
    SlingLocationsMap,
} from './timesheets.utils'
import { StorageClient } from '@/firebase/StorageClient'
import { projectId } from '@/init'
import { SlingClient } from '@/sling/sling-client'
import { throwTrpcError } from '@/utilities'
import { XeroClient } from '@/xero/XeroClient'

const OVERTIME_START = 38

type XeroUserCache = { [key: string]: Employee | undefined }

export const OrdindayEarningsRateMap: Record<FranchiseOrMaster, string> = {
    master: '1ef5805a-5208-4d89-8f35-620104543ed4',
    balwyn: '5c60fbcc-9afa-4f93-a7c8-53a9a0bca39a',
}

export async function generateTimesheets({ startDateInput, endDateInput, studio }: GenerateTimesheetsParams) {
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

    try {
        // break the time period into weeks
        const weeks = getWeeks(startDate, endDate)

        // get all sling users
        const slingUsers = await slingClient.getUsers()

        // cache for xero users
        const xeroUsersCache: XeroUserCache = {}

        const xero = await XeroClient.getInstance(studio)

        const xeroUsers = (await xero.payrollAUApi.getEmployees('')).body.employees

        // to keep track of all rows
        let rows: TimesheetRow[] = []

        // keeps track of users who couldnt be found in xero
        const skippedUsers: string[] = []

        // keeps track of users who have a birthday during the pay period
        const employeesWithBirthday: string[] = []

        // keeps track of users who are under 18, but worked for more than 30 hrs in a single week (in order to be paid super)
        const employeesUnder18Over30Hrs: string[] = []

        // calculate timesheets one week at a time
        for (const week of weeks) {
            // get all shifts for the time period
            const allTimesheets = await slingClient.getTimesheets(week.start.toJSDate(), week.end.toJSDate())
            const timesheets = allTimesheets
                .filter((it) => it.status === 'published')
                .filter((it) => {
                    // depending on the franchise, filter out the location
                    const slingLocation = SlingLocationsMap[it.location.id]
                    if (studio === 'master') {
                        if (slingLocation === 'head-office') return true
                        return !isFranchise(slingLocation)
                    }
                    return slingLocation === studio
                })

            // for each user, get all their timesheets
            for (const slingUser of slingUsers) {
                const usersTimesheets = timesheets.filter((it) => it.user.id === slingUser.id)
                if (usersTimesheets.length === 0) continue

                let xeroUser = xeroUsers?.find(
                    (user) =>
                        user.email?.toLowerCase() === slingUser.email.toLowerCase() ||
                        user.email?.toLowerCase() === slingUser.pending?.toLowerCase()
                )
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
                    xeroUser = await getAndCacheXeroUser(xeroUser.employeeID!, xeroUsersCache, studio)
                    const ordinaryRate = xeroUser.payTemplate?.earningsLines?.find(
                        (line) => line.earningsRateID === OrdindayEarningsRateMap[studio]
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

                const { rows: employeesRows, totalHours } = createTimesheetRows({
                    firstName: xeroUser.firstName,
                    lastName: xeroUser.lastName,
                    dob,
                    hasBirthdayDuringPayrun,
                    isCasual: true,
                    overtimeThreshold: OVERTIME_START,
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

        fs.writeFileSync(tempFilePath, 'first_name,last_name,type,tracking_code,date,hours,notes\n')
        rows.map((row) =>
            fs.appendFileSync(
                tempFilePath,
                `${row.firstName},${row.lastname},${row.payItem},${row.activity},${row.date.toLocaleString(
                    DateTime.DATE_SHORT
                )},${row.hours},${row.summary.replace(/[\r\n]+/gm, '')}\n`
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

async function getAndCacheXeroUser(userId: string, cache: XeroUserCache, studio: FranchiseOrMaster) {
    const cachedUser = cache[userId]
    if (cachedUser) return cachedUser

    const xero = await XeroClient.getInstance(studio)
    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
    const employee = (await xero.payrollAUApi.getEmployee('', userId)).body.employees?.[0]!
    cache[userId] = employee
    return employee
}
