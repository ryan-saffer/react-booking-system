import { DateTime } from 'luxon'

import { getOrCreateCustomer } from '@/square/core/get-or-create-customer'
import { SquareClient } from '@/square/core/square-client'
import { throwTrpcError } from '@/utilities'

type Input = {
    firstName: string
    lastName: string
    email: string
    description: string
    locationId: string
    referenceId: string
    amount: number
    catalogObjectId: string
    daysUntilDue?: number
}

export async function sendPreschoolProgramInvoice(input: Input) {
    const {
        firstName,
        lastName,
        email,
        description,
        locationId,
        referenceId,
        amount,
        catalogObjectId,
        daysUntilDue = 3,
    } = input

    const customerId = await getOrCreateCustomer(firstName, lastName, email)

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
                        catalogObjectId,
                    },
                ],
            },
        })
        .catch((error) => {
            console.log(error)
            throwTrpcError('INTERNAL_SERVER_ERROR', 'error creating order for Preschool Program invoice', error, {
                input,
            })
        })

    if (!order) {
        throwTrpcError('INTERNAL_SERVER_ERROR', 'creating order failed for Preschool Program invoice', null, {
            input,
        })
    }

    if (!order.id) {
        throwTrpcError(
            'INTERNAL_SERVER_ERROR',
            'creating order returned no order id for Preschool Program invoice',
            null,
            {
                input,
            }
        )
    }

    const invoiceNumber = buildPreschoolProgramInvoiceNumber(referenceId, order.id)

    const { invoice } = await square.invoices
        .create({
            invoice: {
                invoiceNumber,
                orderId: order.id,
                primaryRecipient: { customerId },
                paymentRequests: [
                    {
                        requestType: 'BALANCE',
                        dueDate: DateTime.now().plus({ days: daysUntilDue }).toFormat('yyyy-MM-dd'),
                        reminders: [
                            {
                                relativeScheduledDays: -3,
                                message: 'Your Preschool Program invoice is overdue',
                            },
                            {
                                relativeScheduledDays: -7,
                                message: 'Your Preschool Program invoice is overdue',
                            },
                            {
                                relativeScheduledDays: -14,
                                message: 'Your Preschool Program invoice is overdue',
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
            console.log(error)
            throwTrpcError('INTERNAL_SERVER_ERROR', 'error creating invoice for Preschool Program enrolment', error, {
                input,
                orderId: order.id,
            })
        })

    if (!invoice || !invoice.id || !(typeof invoice.version === 'number')) {
        throwTrpcError('INTERNAL_SERVER_ERROR', 'creating invoice failed for Preschool Program', null, {
            input,
            orderId: order.id,
        })
    }

    await square.invoices.publish({
        invoiceId: invoice.id,
        version: invoice.version,
    })

    return invoice
}

function buildPreschoolProgramInvoiceNumber(referenceId: string, orderId: string) {
    return `PP-${referenceId.slice(-6).toUpperCase()}-${orderId.slice(-6).toUpperCase()}`
}
