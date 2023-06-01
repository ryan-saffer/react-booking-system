import { https, logger } from 'firebase-functions'
import { DateTime } from 'luxon'
import { XeroClient } from 'xero-node'
import { SlingClientImpl as SlingClient } from '../core/slingClient'
import { TimesheetRow, createTimesheetRows, getWeeks } from '../core/timesheets'

export const exportTimesheets = https.onRequest(async (req, res) => {
    console.log('started')
    const slingClient = new SlingClient()

    const startDateInput = new Date(2023, 4, 15).toISOString()
    const endDateInput = new Date(2023, 4, 28).toISOString()

    // ensure dates start and end at midnight. End date should be midnight of the next day.
    const startDate = DateTime.fromISO(startDateInput).set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
    const endDate = DateTime.fromISO(endDateInput)
        .plus({ days: 1 })
        .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })

    // validate data
    if (startDate > endDate) {
        res.status(500).send('start date must come before the end date')
        throw new https.HttpsError('invalid-argument', 'start date must come before the end date')
    }

    const diffInDays = endDate.diff(startDate, 'days').days
    if (diffInDays > 28) {
        res.status(500).send('date range must be 28 days or less')
        throw new https.HttpsError('invalid-argument', 'date range must be 28 days or less')
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
        res.status(500).send('error initialising xero api')
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
                    res.status(500).send(
                        `unable to find sling user in xero: ${slingUser.legalName} ${slingUser.lastname}`
                    )
                    throw new https.HttpsError(
                        'aborted',
                        `unable to find sling user in xero: ${slingUser.legalName} ${slingUser.lastname}`
                    )
                }

                rows = [
                    ...rows,
                    ...createTimesheetRows(
                        xeroUser.firstName,
                        xeroUser.lastName,
                        DateTime.fromISO(xeroUser.dateOfBirth),
                        usersTimesheets,
                        slingUser.timezone
                    ),
                ]
            })
        }

        rows.map((row) => {
            console.log(
                `[${row.firstName}, ${row.lastname}, ${row.payItem}, ${row.date.toLocaleString()}, ${row.hours}]`
            )
        })
        res.status(200).send(slingUsers)
    } catch (err) {
        console.error(err)
        res.status(500).send()
    }
})
