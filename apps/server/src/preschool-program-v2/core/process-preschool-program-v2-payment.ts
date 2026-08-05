import { getSquareError, SquareClient } from '@/square/core/square-client'
import { GiftCardInactiveError, PaymentMethodInvalidError } from '@/trpc/trpc.errors'
import { throwCustomTrpcError, throwTrpcError } from '@/utilities'

import {
    FULL_TERM_DISCOUNT_PERCENTAGE,
    FULL_TERM_DISCOUNT_UID,
    getPreschoolProgramV2SessionCatalogObjectId,
} from './preschool-program-v2-config'
import { getDiscountCodeAmountCents } from './preschool-program-v2-pricing'

import type { BookPreschoolProgramV2Props } from './book-preschool-program-v2'
import type { Square } from 'square'

/** Creates and pays the Square order, applying discounts before gift-card and card tenders. */
export async function processPreschoolProgramV2Payment(
    idempotencyKey: string,
    input: BookPreschoolProgramV2Props['payment'],
    parentEmail: string,
    customerId: string
) {
    const square = await SquareClient.getInstance()
    const hasFullTermDiscount = input.lineItems.some((item) => item.isFullTermDiscount)
    const discountCodeAmountCents = getDiscountCodeAmountCents(input)
    const discounts = [
        ...(hasFullTermDiscount
            ? [
                  {
                      uid: FULL_TERM_DISCOUNT_UID,
                      name: `Full term discount - ${FULL_TERM_DISCOUNT_PERCENTAGE}% off`,
                      type: 'FIXED_PERCENTAGE',
                      percentage: FULL_TERM_DISCOUNT_PERCENTAGE.toFixed(2),
                      scope: 'LINE_ITEM',
                  } as const,
              ]
            : []),
        ...(input.discount
            ? [
                  {
                      name:
                          input.discount.discountType === 'percentage'
                              ? `${input.discount.description} - ${input.discount.discountAmount}% off`
                              : input.discount.description,
                      type: 'FIXED_AMOUNT',
                      amountMoney: {
                          amount: BigInt(discountCodeAmountCents),
                          currency: 'AUD',
                      },
                      scope: 'ORDER',
                  } as const,
              ]
            : []),
    ]

    const { order } = await square.orders.create({
        idempotencyKey,
        order: {
            customerId,
            locationId: input.locationId,
            lineItems: input.lineItems.map((item) => ({
                name: item.name,
                quantity: '1',
                basePriceMoney: { currency: 'AUD', amount: BigInt(item.amount) } as const,
                catalogObjectId: getPreschoolProgramV2SessionCatalogObjectId(),
                appliedDiscounts: item.isFullTermDiscount ? [{ discountUid: FULL_TERM_DISCOUNT_UID }] : undefined,
                metadata: {
                    classId: item.classId.toString(),
                    lineItemIdentifier: item.lineItemIdentifier,
                    programType: 'preschool-program-v2',
                },
            })),
            discounts: discounts.length ? discounts : null,
            metadata: {
                programType: 'preschool-program-v2',
                ...(input.discount && {
                    discountCode: input.discount.code,
                    discountCodeType: input.discount.discountType,
                    discountCodeAmount: input.discount.discountAmount.toString(),
                }),
            },
        },
    })

    const orderTotal = order?.totalMoney?.amount ?? BigInt(input.amount)
    if (orderTotal !== BigInt(input.amount)) {
        throwTrpcError('BAD_REQUEST', 'Preschool program payment amount does not match Square order total', null, {
            submittedAmount: input.amount,
            orderTotal: orderTotal.toString(),
        })
    }

    let receiptUrl: string | undefined = undefined
    let amountToPay = orderTotal
    let giftCardPayment = undefined

    if (orderTotal === BigInt(0)) {
        await square.orders.pay({ orderId: order!.id!, paymentIds: [], idempotencyKey })
        const paidOrder: Square.Order = order!
        return { order: paidOrder, paymentReceipt: receiptUrl }
    }

    hasGiftCard: if (input.giftCardId) {
        const { giftCard } = await square.giftCards.get({ id: input.giftCardId })
        if (giftCard?.state !== 'ACTIVE') {
            throwCustomTrpcError(new GiftCardInactiveError())
        }

        if (!giftCard.balanceMoney?.amount || giftCard.balanceMoney.amount === BigInt(0)) {
            break hasGiftCard
        }

        const giftCardAmount = amountToPay <= giftCard.balanceMoney.amount ? amountToPay : giftCard.balanceMoney.amount

        const { payment } = await square.payments.create({
            autocomplete: false,
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
        if (payment?.amountMoney?.amount) {
            amountToPay -= payment.amountMoney.amount
        }
    }

    let payment = undefined
    if (amountToPay > BigInt(0)) {
        const result = await square.payments
            .create({
                autocomplete: false,
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
                if (giftCardPayment) {
                    await square.payments.cancel({ paymentId: giftCardPayment.id! })
                }

                const squareError = await getSquareError(err)
                if (squareError) {
                    const error = squareError.errors[0]
                    if (error.category === 'PAYMENT_METHOD_ERROR') {
                        throwCustomTrpcError(new PaymentMethodInvalidError())
                    }
                }

                throw err
            })

        payment = result.payment
        receiptUrl = payment!.receiptUrl
    }

    const paymentIds: string[] = []
    if (payment) paymentIds.push(payment.id!)
    if (giftCardPayment) paymentIds.push(giftCardPayment.id!)

    await square.orders
        .pay({
            idempotencyKey: `${idempotencyKey}-final-payment`,
            orderId: order!.id!,
            paymentIds,
        })
        .catch(async (err) => {
            await Promise.all(paymentIds.map((paymentId) => square.payments.cancel({ paymentId })))
            throw err
        })

    const paidOrder: Square.Order = order!
    return { order: paidOrder, paymentReceipt: receiptUrl }
}
