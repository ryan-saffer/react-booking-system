import { v4 as uuidv4 } from 'uuid'

import { SquareClient } from '../../square/core/square-client'
import type { BookPlayLabProps } from './book-play-lab'
import { env } from '../../init'

export async function processPaylabPayment(
    input: BookPlayLabProps['payment'],
    parentEmail: string,
    customerId: string
) {
    const squareClient = await SquareClient.getInstance()
    const idempotencyKey = uuidv4()

    const { order } = await squareClient.orders.create({
        idempotencyKey,
        order: {
            customerId,
            locationId: input.locationId,
            lineItems: input.lineItems.map((item) => ({
                name: item.name,
                quantity: item.quantity,
                basePriceMoney: { currency: 'AUD', amount: BigInt(item.amount) } as const,
                catalogObjectId: env === 'prod' ? 'QRUKPRKXKZECIEJLJMTHXBYO' : 'X5IDJPLOXAA3EWEZELC7UVEM', // Play Lab Session
                metadata: {
                    classId: item.classId.toString(),
                    lineItemIdentifier: item.lineItemIdentifier,
                },
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

    let receiptUrl: string | undefined = undefined
    if (order?.totalMoney?.amount === BigInt(0)) {
        await squareClient.orders.pay({ orderId: order!.id!, paymentIds: [], idempotencyKey })
    } else {
        const { payment } = await squareClient.payments.create({
            sourceId: input.token,
            idempotencyKey,
            locationId: input.locationId,
            amountMoney: {
                amount: BigInt(input.amount),
                currency: 'AUD',
            },
            orderId: order!.id,
            customerDetails: {
                customerInitiated: true,
                sellerKeyedIn: false,
            },
            buyerEmailAddress: parentEmail,
            verificationToken: input.buyerVerificationToken,
        })
        receiptUrl = payment!.receiptUrl
    }
    return { paymentReceipt: receiptUrl, order: order! }
}
