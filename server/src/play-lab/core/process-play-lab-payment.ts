import { GiftCardInactiveError } from '@/trpc/trpc.errors'
import { throwCustomTrpcError } from '@/utilities'

import { env } from '../../init'
import { SquareClient } from '../../square/core/square-client'
import type { BookPlayLabProps } from './book-play-lab'

/**
 * Process a play lab payment according to the following steps:
 *
 * 1. Create an order including any discounts
 * 2. If the order total is 0, mark the order as paid.
 * 3. If there is a gift card provided, create a payment for the gift card first.
 * 4. If there is a balance remaining, create a second payment for the rest using the payment token and buyer verification token. If this payment fails, cancel the initial gift card payment.
 * 5. Once both or either payments are made, complete the order using the payments.
 */
export async function processPaylabPayment(
    idempotencyKey: string,
    input: BookPlayLabProps['payment'],
    parentEmail: string,
    customerId: string
) {
    const squareClient = await SquareClient.getInstance()

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
    let amountToPay = BigInt(input.amount)
    let giftCardPayment = undefined

    // if its free, simply process the payment
    if (order?.totalMoney?.amount === BigInt(0)) {
        await squareClient.orders.pay({ orderId: order!.id!, paymentIds: [], idempotencyKey })
        return { paymentReceipt: receiptUrl, order: order! }
    }

    // if there is a gift card, use it first
    hasGiftCard: if (input.giftCardId) {
        // first check the gift card balance
        const { giftCard } = await squareClient.giftCards.get({ id: input.giftCardId })
        if (giftCard?.state !== 'ACTIVE') {
            throwCustomTrpcError(new GiftCardInactiveError())
        }

        if (!giftCard.balanceMoney?.amount || giftCard.balanceMoney.amount === BigInt(0)) {
            break hasGiftCard
        }

        let giftCardAmount = BigInt(0)
        if (amountToPay <= BigInt(giftCard.balanceMoney.amount)) {
            giftCardAmount = amountToPay
        } else if (amountToPay > giftCard.balanceMoney.amount) {
            giftCardAmount = giftCard.balanceMoney.amount
        }

        const { payment } = await squareClient.payments.create({
            autocomplete: false, // allows breaking an order into multiple payments
            sourceId: input.giftCardId,
            idempotencyKey: `${idempotencyKey}-giftcard`,
            locationId: input.locationId,
            amountMoney: {
                currency: 'AUD',
                amount: giftCardAmount,
            },
            orderId: order!.id,
        })

        giftCardPayment = payment

        if (giftCardPayment?.amountMoney?.amount) {
            amountToPay -= giftCardPayment.amountMoney.amount
        }
    }

    let payment = undefined

    // if there is a remaining amount due, pay it
    if (amountToPay > BigInt(0)) {
        const result = await squareClient.payments
            .create({
                autocomplete: false, // allows breaking an order into multiple payments
                sourceId: input.token,
                idempotencyKey: `${idempotencyKey}-base`,
                locationId: input.locationId,
                amountMoney: {
                    currency: 'AUD',
                    amount: amountToPay,
                },
                orderId: order!.id,
                customerDetails: {
                    customerInitiated: true,
                    sellerKeyedIn: false,
                },
                buyerEmailAddress: parentEmail,
                verificationToken: input.buyerVerificationToken,
            })
            .catch(async (err) => {
                // since this errored, if there was a gift card payment already made, reverse it
                if (giftCardPayment) {
                    await squareClient.payments.cancel({ paymentId: giftCardPayment.id! })
                }

                throw err
            })

        payment = result.payment
        receiptUrl = payment!.receiptUrl
    }

    // finally, complete payment
    const paymentIds: string[] = []
    if (payment) {
        paymentIds.push(payment.id!)
    }
    if (giftCardPayment) {
        paymentIds.push(giftCardPayment.id!)
    }

    await squareClient.orders
        .pay({
            idempotencyKey: `${idempotencyKey}-final-payment`,
            orderId: order!.id!,
            paymentIds,
        })
        .catch(async (err) => {
            await Promise.all(paymentIds.map((paymentId) => squareClient.payments.cancel({ paymentId })))
            throw err
        })

    return {
        order: order!,
        paymentReceipt: receiptUrl,
    }
}
