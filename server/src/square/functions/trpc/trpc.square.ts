import { v4 as uuidv4 } from 'uuid'

import { publicProcedure, router } from '../../../trpc/trpc'
import { onRequestTrpc } from '../../../trpc/trpc.adapter'
import { SquareClient } from '../../core/square-client'

export const squareRouter = router({
    createPayment: publicProcedure
        .input(
            (input) =>
                input as {
                    token: string
                    locationId: string
                    amount: number // in cents
                    lineItems: {
                        name: string
                        amount: number // in cents
                        quantity: string
                    }[]
                    discount: null | { type: 'number' | 'percentage'; amount: number; name: string } // percentage amount in format '7.25' for 7.25%
                }
        )
        .mutation(async ({ input }) => {
            const squareClient = await SquareClient.getInstance()
            const idempotencyKey = uuidv4()

            const { order } = await squareClient.orders.create({
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
                },
            })

            if (!order?.id) return

            await squareClient.payments.create({
                sourceId: input.token,
                idempotencyKey,
                locationId: input.locationId,
                amountMoney: {
                    amount: BigInt(input.amount),
                    currency: 'AUD',
                },
                orderId: order.id,
                customerDetails: {
                    customerInitiated: true,
                    sellerKeyedIn: false,
                },
            })
        }),
})

export const square = onRequestTrpc(squareRouter)
