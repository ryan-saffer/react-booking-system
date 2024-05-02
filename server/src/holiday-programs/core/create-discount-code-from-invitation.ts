import { DiscountCode, WithoutId } from 'fizz-kidz'
import { DateTime } from 'luxon'

import { DatabaseClient } from '../../firebase/DatabaseClient'
import { MixpanelClient, MixpanelEvent } from '../../mixpanel/mixpanel-client'
import { MailClient } from '../../sendgrid/MailClient'
import { logError, throwTrpcError } from '../../utilities'
import { generateRandomString } from '../../utilities/stringUtils'
import { ZohoClient } from '../../zoho/zoho-client'
import { checkDiscountCode } from './check-discount-code'

export type CreateDiscountCodeFromInvitation = WithoutId<
    Omit<
        DiscountCode,
        'code' | 'expiryDate' | 'numberOfUses' | 'discountType' | 'discountAmount' | 'numberOfUsesAllocated'
    >
> & {
    name: string
    email: string
    invitationId: string
    viewUsed: MixpanelEvent['invitation-coupon-signup']['view']
}

/**
 * Creates a discount code for the upcoming holiday programs, issued with a single use.
 * Could technically be abused, as it's exposed publically. Future improvements could issue a single code per email address.
 */
export async function createDiscountCodeFromInvitation(discountCode: CreateDiscountCodeFromInvitation) {
    const code = `${discountCode.name}-${generateRandomString(5)}`
    const existingCode = await checkDiscountCode(code)
    if (existingCode !== 'not-found') {
        throwTrpcError('PRECONDITION_FAILED', `Discount code '${code}' already exists.`)
    }

    const CUT_OFF_DATES = [
        DateTime.fromISO('2024-04-10'),
        DateTime.fromISO('2024-07-10'),
        DateTime.fromISO('2024-10-03'),
        DateTime.fromISO('2025-01-20'),
    ]

    const today = new Date()
    let expiryDate = new Date()

    for (const date of CUT_OFF_DATES.reverse()) {
        if (today < date.toJSDate()) {
            expiryDate = date.toJSDate()
        }
    }

    try {
        const zohoClient = new ZohoClient()
        await zohoClient.addBirthdayPartyGuestContact({
            firstName: discountCode.name,
            email: discountCode.email,
        })
    } catch (err) {
        logError('error adding birthday party guest contact to zoho', err)
    }

    await DatabaseClient.createDiscountCode({
        code,
        discountType: 'percentage',
        discountAmount: 10,
        expiryDate,
        numberOfUses: 0,
        numberOfUsesAllocated: 1,
    })

    await DatabaseClient.addGuestToInvitation(
        { name: discountCode.name, email: discountCode.email },
        discountCode.invitationId
    )

    const mailClient = await MailClient.getInstance()
    await mailClient.sendEmail('createDiscountCode', discountCode.email, {
        name: discountCode.name,
        code: code,
        expiryDate: DateTime.fromJSDate(expiryDate, { zone: 'Australia/Melbourne' }).toFormat('dd/LL/yyyy'),
    })

    const mixpanel = await MixpanelClient.getInstance()
    await mixpanel.track('invitation-coupon-signup', {
        invitationId: discountCode.invitationId,
        view: discountCode.viewUsed,
    })
}
