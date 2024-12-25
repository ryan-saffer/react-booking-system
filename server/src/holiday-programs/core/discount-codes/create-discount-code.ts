import { DiscountCode, WithoutId } from 'fizz-kidz'

import { DatabaseClient } from '../../../firebase/DatabaseClient'
import { throwTrpcError } from '../../../utilities'
import { checkDiscountCode } from './check-discount-code'

export type CreateDiscountCode = WithoutId<Omit<DiscountCode, 'numberOfUses'>>
/**
 * Creates a discount code.
 * @param discountCode
 */
export async function createDiscountCode(discountCode: CreateDiscountCode) {
    const existingCode = await checkDiscountCode(discountCode.code)
    if (existingCode !== 'not-found') {
        throwTrpcError('PRECONDITION_FAILED', `Discount code '${discountCode.code}' already exists.`)
    }
    discountCode.expiryDate = new Date(discountCode.expiryDate)

    await DatabaseClient.createDiscountCode({
        discountType: discountCode.discountType,
        discountAmount: discountCode.discountAmount,
        code: discountCode.code,
        expiryDate: discountCode.expiryDate,
        numberOfUses: 0,
        numberOfUsesAllocated: discountCode.numberOfUsesAllocated,
    })
}
