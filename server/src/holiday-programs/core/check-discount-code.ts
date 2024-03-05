import { DatabaseClient } from '../../firebase/DatabaseClient'

export async function checkDiscountCode(code: string) {
    const existingDiscountCodes = await DatabaseClient.checkDiscountCode(code)
    // each certificate should only exist once in the db. this is enforced when creating codes.
    if (existingDiscountCodes.length > 0) {
        const discountCode = existingDiscountCodes[0]
        if (new Date() > discountCode.expiryDate) {
            return 'expired'
        }
        if (discountCode.numberOfUses >= discountCode.numberOfUsesAllocated) {
            return 'exhausted'
        }
        return discountCode
    }

    return 'not-found'
}
