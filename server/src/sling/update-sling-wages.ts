import { logger } from 'firebase-functions/v2'
import { DateTime } from 'luxon'

import { ORDINARY_PAY_EARNINGS_RATE_ID } from '@/staff/core/timesheets/generate-timesheets'
import { PositionToId, getPositionRate } from '@/staff/core/timesheets/timesheets.utils'
import { logError } from '@/utilities'
import { XeroClient } from '@/xero/XeroClient'

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

    const activeUsers = users.filter((it) => it.active === true && it.employeeId)

    const xero = await XeroClient.getInstance()

    // iterate each user in sling. For each position, edit/create a wage line for the position
    for (const user of activeUsers) {
        const body: UpdateWagesBody = []
        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
        const employee = (await xero.payrollAUApi.getEmployee('', user.employeeId)).body.employees?.[0]!
        logger.log(`Fetching Xero info for ${employee.firstName} ${employee.lastName}`)
        const ordinaryRate = employee.payTemplate?.earningsLines?.find(
            (line) => line.earningsRateID === ORDINARY_PAY_EARNINGS_RATE_ID
        )?.ratePerUnit
        if (!ordinaryRate) {
            logger.log(`unable to find ordinary earnings rate in Xero for user: ${user.legalName} ${user.lastname}`)
            continue
        }

        // In order to assign wages to a shift, the the shift must first be assigned to the user or it will 409.
        // If we instead skipped this shift (since its not assigned), the user can still be assigned shifts at this position, and those shifts will appear as $0 shifts.
        // Therefore, we assign all shifts to all users.
        try {
            await slingClient.addShiftsToUser(user.id, Object.values(PositionToId))
        } catch (err) {
            logError(`Error adding shifts to user: ${user.id}`, err, {
                shiftsToAdd: Object.values(PositionToId),
            })
            continue
        }

        // iterate all positions
        for (const positionId of Object.values(PositionToId)) {
            body.push({
                // if editing, (wage item for this position already exists), update it by providing the id. Otherwise it will create. [It will 409 confict if this logic is wrong].
                ...(user.wages?.[positionId] && { id: user.wages[positionId][0].id }),
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
                userId: user.id,
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
