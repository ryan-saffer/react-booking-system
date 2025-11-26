import { SquareError } from 'square'

import { env } from '@/init'
import { getOrCreateCustomer } from '@/square/core/get-or-create-customer'
import { SquareClient } from '@/square/core/square-client'
import { GiftCardInactiveError, PaymentMethodInvalidError } from '@/trpc/trpc.errors'
import { throwCustomTrpcError, throwTrpcError } from '@/utilities'

import type { HolidayProgramBookingProps } from './book-holiday-program'

/**
 * Process a holiday program payment according to the following steps:
 *
 * 1. Create an order including any discounts
 * 2. If the order total is 0, mark the order as paid.
 * 3. If there is a gift card provided, create a payment for the gift card first.
 * 4. If there is a balance remaining, create a second payment for the rest using the payment token and buyer verification token. If this payment fails, cancel the initial gift card payment.
 * 5. Once both or either payments are made, complete the order using the payments.
 */
export async function processHolidayProgramPayment(input: HolidayProgramBookingProps) {
    // get or create customer in square
    const customerId = await getOrCreateCustomer(input.parentFirstName, input.parentLastName, input.parentEmail)

    // MARK: Process payment
    const square = await SquareClient.getInstance()

    const { order } = await square.orders
        .create({
            idempotencyKey: input.idempotencyKey,
            order: {
                customerId,
                locationId: input.payment.locationId,
                lineItems: input.payment.lineItems.map((item) => ({
                    name: item.name,
                    quantity: item.quantity,
                    basePriceMoney: { currency: 'AUD', amount: BigInt(item.amount) },
                    catalogObjectId: env === 'prod' ? '4B3QJRX5DK34ZFWVGXRZ4U67' : 'REHIF6QHHSED6UALQA36JMPJ', // Holiday program session
                    metadata: {
                        classId: item.classId.toString(),
                        lineItemIdentifier: item.lineItemIdentifier,
                    },
                })),
                discounts: input.payment.discount
                    ? input.payment.discount.discountType === 'percentage'
                        ? [
                              {
                                  type: 'FIXED_PERCENTAGE',
                                  percentage: input.payment.discount.discountAmount.toFixed(2),
                                  name: input.payment.discount.description,
                              },
                          ]
                        : [
                              {
                                  type: 'FIXED_AMOUNT',
                                  amountMoney: {
                                      currency: 'AUD',
                                      amount: BigInt(input.payment.discount.discountAmount),
                                  },
                                  name: input.payment.discount.description,
                              },
                          ]
                    : null,
                metadata: {
                    programType: 'holiday-program',
                },
            },
        })
        .catch((error) =>
            throwTrpcError('INTERNAL_SERVER_ERROR', 'Error creating order for holiday program payment', error, {
                input,
            })
        )

    let recieptUrl: string | undefined = undefined
    let amountToPay = BigInt(input.payment.amount)
    let giftCardPayment = undefined

    // if its free, simply process the payment
    if (order?.totalMoney?.amount === BigInt(0)) {
        await square.orders.pay({ orderId: order!.id!, paymentIds: [], idempotencyKey: input.idempotencyKey })
        return {
            orderId: order!.id!,
            recieptUrl,
        }
    }

    // if there is a gift card, use it first
    hasGiftCard: if (input.payment.giftCardId) {
        // first check the gift card balance
        const { giftCard } = await square.giftCards
            .get({ id: input.payment.giftCardId })
            .catch((err) =>
                throwTrpcError(
                    'INTERNAL_SERVER_ERROR',
                    `Error looking up gift card with id: ${input.payment.giftCardId}`,
                    err,
                    { input }
                )
            )
        if (giftCard?.state !== 'ACTIVE') {
            throwCustomTrpcError(new GiftCardInactiveError())
        }

        if (!giftCard.balanceMoney?.amount || giftCard.balanceMoney?.amount === BigInt(0)) {
            break hasGiftCard
        }

        let giftCardAmount = BigInt(0)
        if (amountToPay <= BigInt(giftCard.balanceMoney.amount)) {
            giftCardAmount = amountToPay
        } else if (amountToPay > giftCard.balanceMoney.amount) {
            giftCardAmount = giftCard.balanceMoney.amount
        }

        const { payment } = await square.payments
            .create({
                autocomplete: false, // allows breaking an order into multiple payments
                sourceId: input.payment.giftCardId,
                idempotencyKey: `${input.idempotencyKey}-giftcard`,
                locationId: input.payment.locationId,
                amountMoney: {
                    currency: 'AUD',
                    amount: giftCardAmount,
                },
                orderId: order!.id,
            })
            .catch((err) =>
                throwTrpcError(
                    'INTERNAL_SERVER_ERROR',
                    'Error occurred processing gift card payment for holiday program',
                    err,
                    { input }
                )
            )

        giftCardPayment = payment

        if (giftCardPayment?.amountMoney?.amount) {
            amountToPay -= giftCardPayment.amountMoney.amount
        }
    }

    let payment = undefined
    // if there is a remaining amount due, pay it
    if (amountToPay > BigInt(0)) {
        const result = await square.payments
            .create({
                autocomplete: false, // allows breaking an order into multiple payments
                sourceId: input.payment.token,
                idempotencyKey: `${input.idempotencyKey}-base`,
                locationId: input.payment.locationId,
                amountMoney: {
                    currency: 'AUD',
                    amount: amountToPay,
                },
                orderId: order!.id,
                customerDetails: {
                    customerInitiated: true,
                    sellerKeyedIn: false,
                },
                buyerEmailAddress: input.parentEmail,
                verificationToken: input.payment.buyerVerificationToken,
            })
            .catch(async (err) => {
                // since this errored, if there was a gift card payment already made, reverse it.
                if (giftCardPayment) {
                    await square.payments.cancel({ paymentId: giftCardPayment.id! })
                }

                if (err instanceof SquareError) {
                    const error = err.errors[0]
                    if (error.category === 'PAYMENT_METHOD_ERROR') {
                        throwCustomTrpcError(new PaymentMethodInvalidError())
                    }
                }
                throwTrpcError('INTERNAL_SERVER_ERROR', 'Unable to process payment for holiday program', err, {
                    input,
                })
            })
        payment = result.payment
        recieptUrl = payment!.receiptUrl
    }

    // finally, complete payment
    const paymentIds: string[] = []
    if (payment) {
        paymentIds.push(payment.id!)
    }
    if (giftCardPayment) {
        paymentIds.push(giftCardPayment.id!)
    }
    await square.orders
        .pay({
            idempotencyKey: `${input.idempotencyKey}-final-payment`,
            orderId: order!.id!,
            paymentIds,
        })
        .catch(async (err) => {
            await Promise.all(paymentIds.map((paymentId) => square.payments.cancel({ paymentId })))
            throwTrpcError(
                'INTERNAL_SERVER_ERROR',
                'Error paying for holiday program order after already accepting unfinalised payments',
                err,
                { input, paymentIds }
            )
        })

    return {
        orderId: order!.id!,
        recieptUrl,
    }
}
