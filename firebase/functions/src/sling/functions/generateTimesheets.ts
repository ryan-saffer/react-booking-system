import { https, logger } from 'firebase-functions'
import { DateTime } from 'luxon'
import { XeroClient } from 'xero-node'
import { SlingClient } from '../core/slingClient'
import { TimesheetRow, createTimesheetRows, getWeeks, hasBirthdayDuring } from '../core/timesheets'
import path from 'path'
import os from 'os'
import fs from 'fs'
import { projectName, storage } from '../../init'
import { onCall } from '../../utilities'

export const generateTimesheets = onCall<'generateTimesheets'>(async ({ startDateInput, endDateInput }) => {
    console.log('started')
    const slingClient = new SlingClient()

    // ensure dates start and end at midnight
    const startDate = DateTime.fromISO(startDateInput).set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
    const endDate = DateTime.fromISO(endDateInput).set({ hour: 0, minute: 0, second: 0, millisecond: 0 })

    // validate data
    if (startDate > endDate) {
        throw new https.HttpsError('invalid-argument', 'start date must come before the end date', {
            errorCode: 'invalid-range',
        })
    }

    const diffInDays = endDate.diff(startDate, 'days').days
    if (diffInDays > 28) {
        throw new https.HttpsError('invalid-argument', 'date range must be 28 days or less', {
            errorCode: 'invalid-length',
        })
    }

    // initialise xero
    let xero: XeroClient
    try {
        xero = new XeroClient({
            clientId: process.env.XERO_CLIENT_ID ?? '',
            clientSecret: process.env.XERO_CLIENT_SECRET ?? '',
            grantType: 'client_credentials',
        })

        const tokenSet = await xero.getClientCredentialsToken()
        xero.setTokenSet(tokenSet)
    } catch (err) {
        logger.error('error initialising xero api')
        logger.error(err)
        throw new https.HttpsError('aborted', 'error initialising xero api')
    }

    try {
        // break the time period into weeks
        const weeks = getWeeks(startDate, endDate)

        // get all active users
        const slingUsers = await slingClient.getUsers()
        const activeSlingUsers = slingUsers.filter((user) => user.active)

        // get all xero users
        const xeroUsers = (await xero.payrollAUApi.getEmployees('')).body.employees

        // to keep track of all rows
        let rows: TimesheetRow[] = []

        // keeps tracked of users who couldnt be found in xero
        const skippedUsers: string[] = []

        // calculate timesheets one week at a time
        for (const week of weeks) {
            // get all shifts for the time period
            const allTimesheets = await slingClient.getTimesheets(week.start.toJSDate(), week.end.toJSDate())
            const timesheets = allTimesheets.filter((it) => it.status === 'published')

            // for each user, get all their timesheets
            activeSlingUsers.map((slingUser) => {
                const usersTimesheets = timesheets.filter((it) => it.user.id === slingUser.id)
                if (usersTimesheets.length === 0) return

                const xeroUser = xeroUsers?.find((user) => user.employeeID === slingUser.employeeId)
                if (!xeroUser) {
                    logger.error(`unable to find sling user in xero: ${slingUser.legalName} ${slingUser.lastname}`)
                    skippedUsers.push(`${slingUser.legalName} ${slingUser.lastname}`)
                    return
                }

                // calculate if the user has a birthday during this fortnight
                const dob = DateTime.fromJSDate(new Date(xeroUser.dateOfBirth))
                const hasBirthdayDuringPayrun = hasBirthdayDuring(dob, startDate, endDate)

                // only bonnie is not casual
                const isCasual = slingUser.employeeId !== '1551679a-9e81-47d3-b019-906d7ce617f1'

                rows = [
                    ...rows,
                    ...createTimesheetRows({
                        firstName: xeroUser.firstName,
                        lastName: xeroUser.lastName,
                        dob,
                        isCasual,
                        hasBirthdayDuringPayrun,
                        usersTimesheets,
                        timezone: slingUser.timezone,
                    }),
                ]
            })
        }

        // create the csv
        const filename = `${startDate.toISODate()}:${DateTime.fromISO(endDateInput).toISODate()}.csv`
        const tempFilePath = path.join(os.tmpdir(), filename)
        console.log('temp file path:', tempFilePath)

        fs.writeFileSync(tempFilePath, 'first_name,last_name,type, date,hours,has_birthday_during_payrun\n')
        rows.map((row) =>
            fs.appendFileSync(
                tempFilePath,
                `${row.firstName},${row.lastname},${row.payItem},${row.date.toFormat('d/M/y')},${row.hours},${
                    row.hasBirthdayDuringPayrun
                }\n`
            )
        )

        const [file] = await storage
            .bucket(`${projectName}.appspot.com`)
            .upload(tempFilePath, { destination: `payroll/${filename}` })

        const url = await file.getSignedUrl({
            action: 'read',
            expires: DateTime.now().plus({ days: 7 }).toISODate(),
        })
        const downloadUrl = url[0]

        // remove duplicate skipped users
        return { url: downloadUrl, skippedEmployees: [...new Set(skippedUsers)] }
    } catch (err) {
        console.error('error generating timesheets', err)
        throw new https.HttpsError('internal', 'error generating timesheets', err)
    }
})