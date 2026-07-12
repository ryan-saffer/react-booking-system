import { strictEqual } from 'assert'

import { getDiscountCodeAmountCents } from './preschool-program-v2-pricing'

import type { BookPreschoolProgramV2Props } from './book-preschool-program-v2'

function makePaymentInput(
    lineItems: Array<{ amount: number; isFullTermDiscount: boolean }>,
    discount: BookPreschoolProgramV2Props['payment']['discount']
): BookPreschoolProgramV2Props['payment'] {
    return {
        token: 'token',
        buyerVerificationToken: 'buyer-token',
        giftCardId: '',
        locationId: 'location',
        amount: 0,
        discount,
        lineItems: lineItems.map((lineItem, index) => ({
            name: `Line ${index}`,
            amount: lineItem.amount,
            classId: index + 1,
            lineItemIdentifier: `line-${index + 1}`,
            appointmentTypeID: 94471769,
            time: '2026-06-15T10:00:00.000+10:00',
            duration: 150,
            calendarID: 1,
            childFirstName: 'Child',
            childLastName: 'Test',
            childDob: '2022-01-01T00:00:00.000Z',
            childAllergies: '',
            childIsAnaphylactic: false,
            childAnaphylaxisPlanStoragePath: '',
            childAdditionalInfo: '',
            isFullTermDiscount: lineItem.isFullTermDiscount,
        })),
    }
}

describe('processPreschoolProgramV2Payment pricing helpers', () => {
    it('calculates percentage discount codes after full-term discounts', () => {
        const input = makePaymentInput(
            [
                { amount: 5400, isFullTermDiscount: true },
                { amount: 5400, isFullTermDiscount: true },
                { amount: 5400, isFullTermDiscount: true },
                { amount: 5400, isFullTermDiscount: false },
                { amount: 5400, isFullTermDiscount: false },
            ],
            {
                id: 'discount-10',
                code: '10',
                description: "Discount code '10'",
                discountType: 'percentage',
                discountAmount: 10,
                expiryDate: new Date('2099-01-01T00:00:00.000Z'),
                numberOfUses: 0,
                numberOfUsesAllocated: 100,
            }
        )

        strictEqual(getDiscountCodeAmountCents(input), 2376)
    })

    it('calculates fixed discount codes in cents', () => {
        const input = makePaymentInput([{ amount: 5400, isFullTermDiscount: false }], {
            id: 'discount-20',
            code: '20',
            description: "Discount code '20'",
            discountType: 'price',
            discountAmount: 20,
            expiryDate: new Date('2099-01-01T00:00:00.000Z'),
            numberOfUses: 0,
            numberOfUsesAllocated: 100,
        })

        strictEqual(getDiscountCodeAmountCents(input), 2000)
    })
})
