import { v4 as uuidv4 } from 'uuid'

import { SquareClient } from '../../square/core/square-client'
import type { BookPlayLabProps } from './book-play-lab'

export async function processPaylabPayment(input: BookPlayLabProps['payment'], parentEmail: string) {
    const squareClient = await SquareClient.getInstance()
    const idempotencyKey = uuidv4()

    const { order, errors: orderErrors } = await squareClient.orders.create({
        idempotencyKey,
        order: {
            locationId: input.locationId,
            lineItems: input.lineItems.map((item) => ({
                ...item,
                basePriceMoney: { currency: 'AUD', amount: BigInt(item.amount) } as const,
            })),
            discounts: input.discount
                ? input.discount.type === 'percentage'
                    ? [
                          {
                              type: 'FIXED_PERCENTAGE',
                              percentage: input.discount.amount.toFixed(2),
                              name: input.discount.name,
                          },
                      ]
                    : [
                          {
                              type: 'FIXED_AMOUNT',
                              amountMoney: { amount: BigInt(input.discount.amount), currency: 'AUD' },
                              name: input.discount.name,
                          },
                      ]
                : null,
            metadata: {
                programType: 'play-lab',
            },
        },
    })

    if (orderErrors) return { errors: orderErrors }

    const { payment, errors: paymentErrors } = await squareClient.payments.create({
        sourceId: input.token,
        idempotencyKey,
        locationId: input.locationId,
        amountMoney: {
            amount: BigInt(input.amount),
            currency: 'AUD',
        },
        orderId: order!.id, // if orderErrors null, order exists
        customerDetails: {
            customerInitiated: true,
            sellerKeyedIn: false,
        },
        buyerEmailAddress: parentEmail,
        verificationToken: input.buyerVerificationToken,
    })

    if (paymentErrors) return { errors: paymentErrors }

    return { payment: payment! } // isPaymentErrors is null, payment exists
}
