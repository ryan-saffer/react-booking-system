import { DateTime } from 'luxon'

import { env } from '@/init'
import { getOrCreateCustomer } from '@/square/core/get-or-create-customer'
import { SquareClient } from '@/square/core/square-client'
import { throwTrpcError } from '@/utilities'

export async function sendInvoice(input: {
    firstName: string
    lastName: string
    email: string
    description: string
    locationId: string
    referenceId: string
    amount: number
    daysUntilDue?: number
    metadata?: Record<string, string>
}) {
    const {
        firstName,
        lastName,
        email,
        description,
        locationId,
        referenceId,
        amount,
        daysUntilDue = 3,
        metadata,
    } = input
    // 1. get or create customer
    const customerId = await getOrCreateCustomer(firstName, lastName, email)

    // 2. create invoice items
    const square = await SquareClient.getInstance()
    const { order } = await square.orders
        .create({
            order: {
                customerId,
                locationId,
                referenceId,
                source: {
                    name: 'Fizz Kidz Portal',
                },
                lineItems: [
                    {
                        name: description,
                        quantity: '1',
                        basePriceMoney: {
                            currency: 'AUD',
                            amount: BigInt(amount),
                        },
                        catalogObjectId: env === 'prod' ? '263WT2LGSAT5VJJA6FDE2CHH' : 'DFP3SILGH6TGT5PDALWSUNOB', // after school program enrolment
                    },
                ],
                metadata,
            },
        })
        .catch((error) =>
            throwTrpcError('INTERNAL_SERVER_ERROR', 'error creating order for after school program enrolment', error, {
                input,
            })
        )

    if (!order)
        throwTrpcError('INTERNAL_SERVER_ERROR', 'creating order failed for after school program invoice', null, {
            input,
        })

    const { invoice } = await square.invoices
        .create({
            invoice: {
                orderId: order.id,
                primaryRecipient: { customerId },
                paymentRequests: [
                    {
                        requestType: 'BALANCE',
                        dueDate: DateTime.now().plus({ days: daysUntilDue }).toFormat('yyyy-MM-dd'),
                        reminders: [
                            {
                                relativeScheduledDays: -3,
                                message: 'Your after school program invoice is overdue',
                            },
                            {
                                relativeScheduledDays: -7,
                                message: 'Your after school program invoice is overdue',
                            },
                            {
                                relativeScheduledDays: -14,
                                message: 'Your after school program invoice is overdue',
                            },
                        ],
                    },
                ],
                deliveryMethod: 'EMAIL',
                acceptedPaymentMethods: {
                    card: true,
                },
                title: description,
            },
        })
        .catch((error) => {
            throwTrpcError('INTERNAL_SERVER_ERROR', 'error creating invoice for after school enrolment', error, {
                input,
                orderId: order.id,
            })
        })

    if (!invoice || !invoice.id || !(typeof invoice.version === 'number'))
        throwTrpcError('INTERNAL_SERVER_ERROR', 'creating invoice failed for after school program', null, {
            input,
            orderId: order.id,
        })

    await square.invoices.publish({
        invoiceId: invoice.id,
        version: invoice.version,
    })

    return invoice
}
