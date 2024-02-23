import { DateTime } from 'luxon'

import { DatabaseClient } from '../../firebase/DatabaseClient'
import { HubspotClient } from '../../hubspot/HubspotClient'
import { MailClient } from '../../sendgrid/MailClient'
import { CreateDiscountCode } from '../functions/trpc/trpc.holiday-programs'
import { checkDiscountCode } from './check-discount-code'

/**
 * Creates a discount code. If 'auto-upcoming' provided as expiry date, it will expire near the end of the
 * upcoming holiday programs. Choosing this will also email the customer a copy of the discount code.
 * @param discountCode
 */
export async function createDiscountCode(discountCode: CreateDiscountCode) {
    const existingCode = await checkDiscountCode(discountCode.code)
    if (existingCode !== 'not-found') {
        throw new Error(`Discount code '${discountCode.code}' already exists.`)
    }
    let expiryDate = new Date()
    if (discountCode.expiryDate === 'auto-upcoming') {
        const CUT_OFF_DATES = [
            DateTime.fromISO('2024-04-10'),
            DateTime.fromISO('2024-07-10'),
            DateTime.fromISO('2024-10-03'),
            DateTime.fromISO('2025-01-20'),
        ]
        const today = new Date()

        for (const date of CUT_OFF_DATES.reverse()) {
            if (today < date.toJSDate()) {
                expiryDate = date.toJSDate()
            }
        }

        const hubspotClient = await HubspotClient.getInstance()
        await hubspotClient.addBirthdayPartyGuestContact({
            firstName: discountCode.name,
            email: discountCode.email,
        })

        const mailClient = await MailClient.getInstance()
        await mailClient.sendEmail('createDiscountCode', discountCode.email, {
            name: discountCode.name,
            code: discountCode.code,
            expiryDate: DateTime.fromJSDate(expiryDate).toLocaleString(DateTime.DATE_SHORT),
        })
    } else {
        expiryDate = discountCode.expiryDate
    }

    await DatabaseClient.createDiscountCode({ ...discountCode, expiryDate })

    if (discountCode.expiryDate === 'auto-upcoming') {
        await DatabaseClient.addGuestToInvitation(
            { name: discountCode.name, email: discountCode.email },
            discountCode.invitationId
        )
    }
}
