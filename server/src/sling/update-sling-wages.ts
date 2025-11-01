import { logger } from 'firebase-functions/v2'
import { ObjectKeys, isFranchise, type FranchiseOrMaster, type FranchiseStudio, type Studio } from 'fizz-kidz'
import { DateTime } from 'luxon'

import { OrdindayEarningsRateMap } from '@/staff/core/timesheets/generate-timesheets'
import { LocationToId, PositionToId, getPositionRate } from '@/staff/core/timesheets/timesheets.utils'
import { logError } from '@/utilities'
import { XeroClient } from '@/xero/XeroClient'
import type { Employee } from 'xero-node/dist/gen/model/payroll-au/employee'

import { SlingClient } from './sling-client'
import type { UpdateWagesBody } from './sling.types'

/**
 * Iterates all active Sling users with an employee ID, and
 * 1) Assignes them to every shift in Sling
 * 2) Fetches their ordinary rate from Xero
 * 3) Assigns a wage to every shift
 *
 * This allows Sling wages estimations to as closely resemble the actual cost as possible.
 *
 * Discrepency in Sling vs actual wages can be due to:
 * - Employee not yet created in Xero
 * - Travel allowance
 * - Overtime
 * - Employee had a birthday during the pay cycle (will look cheaper in advance, and more expense looking back)
 */
export async function updateSlingWages() {
    logger.log('📊 Updating Wages in Sling...')

    const slingClient = new SlingClient()
    const users = await slingClient.getUsers()

    const activeUsers = users.filter((it) => it.active === true)

    // a cache for the 'GET all employees' endpoint for each franchise
    // needed in order to find the employee's xero employeeId
    const xeroUsersByStudioCache: Partial<Record<FranchiseOrMaster, Employee[]>> = {}

    // iterate each user in sling. For each position, edit/create a wage line for the position
    for (const slingUser of activeUsers) {
        // if an employee is assigned a franchise, use that franchise to lookup their rate, otherwise use master
        // head office is safe, because we default to master
        let studio: FranchiseOrMaster = 'master'
        for (const location of ObjectKeys(LocationToId)) {
            if (slingUser.groupIds.includes(LocationToId[location]) && isFranchise(location as Studio)) {
                studio = location as FranchiseStudio
            }
        }
        const xero = await XeroClient.getInstance(studio)
        const xeroUsers = await getAndCacheAllXeroEmployees(studio, xeroUsersByStudioCache)
        const xeroUser = xeroUsers?.find((user) => user.email?.toLowerCase() === slingUser.email.toLowerCase())

        if (!xeroUser) {
            logger.warn(
                `unable to find sling user in xero for the ${studio} studio: ${slingUser.legalName} ${slingUser.lastname} - ${slingUser.email}`
            )
            continue
        }

        const body: UpdateWagesBody = []
        logger.log(`Fetching Xero info for ${xeroUser.firstName} ${xeroUser.lastName}`)
        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
        const employee = (await xero.payrollAUApi.getEmployee('', xeroUser.employeeID!)).body.employees?.[0]!
        const ordinaryRate = employee.payTemplate?.earningsLines?.find(
            (line) => line.earningsRateID === OrdindayEarningsRateMap[studio]
        )?.ratePerUnit
        if (!ordinaryRate) {
            logger.warn(
                `unable to find ordinary earnings rate in Xero for user: ${slingUser.legalName} ${slingUser.lastname}`
            )
            continue
        }

        // In order to assign wages to a shift, the the shift must first be assigned to the user or it will 409.
        // If we instead skipped this shift (since its not assigned), the user can still be assigned shifts at this position, and those shifts will appear as $0 shifts.
        // Therefore, we assign all shifts to all users.
        try {
            await slingClient.addShiftsToUser(slingUser.id, Object.values(PositionToId))
        } catch (err) {
            logError(`Error adding shifts to user: ${slingUser.id}`, err, {
                shiftsToAdd: Object.values(PositionToId),
            })
            continue
        }

        // iterate all positions
        for (const positionId of Object.values(PositionToId)) {
            body.push({
                // if editing, (wage item for this position already exists), update it by providing the id. Otherwise it will create. [It will 409 confict if this logic is wrong].
                ...(slingUser.wages?.[positionId] && { id: slingUser.wages[positionId][0].id }),
                dateEffective: DateTime.fromJSDate(new Date(employee.startDate!)).toFormat('yyyy-LL-dd'),
                fromDate: new Date(employee.startDate!).toISOString(),
                positionId: positionId,
                isSalary: false,
                locationId: null,
                regularRate: getPositionRate({
                    positionId,
                    rate: ordinaryRate,
                    dob: DateTime.fromJSDate(new Date(employee.dateOfBirth)),
                }),
                userId: slingUser.id,
                _edited: false,
            })
        }

        try {
            await slingClient.updateWages(body)
        } catch (err) {
            logError('Error updating wages', err)
            continue
        }
        logger.log(`✔︎ ${employee.firstName} ${employee.lastName}`)
    }
    logger.log('✅ Wages updated successfully')
}

async function getAndCacheAllXeroEmployees(
    studio: FranchiseOrMaster,
    cache: Partial<Record<FranchiseOrMaster, Employee[]>>
) {
    const xero = await XeroClient.getInstance(studio)
    if (!cache[studio]) {
        const employees = (await xero.payrollAUApi.getEmployees('')).body.employees
        cache[studio] = employees
    }
    return cache[studio]
}
