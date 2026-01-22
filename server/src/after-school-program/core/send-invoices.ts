import {
    getSquareLocationId,
    type AfterSchoolEnrolment,
    type InvoiceStatusMap,
    type SendInvoiceParams,
} from 'fizz-kidz'


import { DatabaseClient } from '@/firebase/DatabaseClient'
import { env } from '@/init'
import { SquareClient } from '@/square/core/square-client'
import { throwTrpcError } from '@/utilities'

import { sendInvoice } from './send-invoice'

import type { InvoiceStatus } from 'square/api'

export async function sendInvoices(input: SendInvoiceParams[]) {
    const invoiceStatusMap: InvoiceStatusMap = {}
    try {
        const square = await SquareClient.getInstance()

        await Promise.all(
            input.map(async (invoiceData) => {
                // 1. Get enrolment
                const enrolment = await DatabaseClient.getAfterSchoolEnrolment(invoiceData.id)

                // 2. cancel any existing invoice
                if (enrolment.invoiceId) {
                    // first check if paid, cannot cancel a paid invoice
                    const { invoice: existingInvoice } = await square.invoices.get({
                        invoiceId: enrolment.invoiceId,
                    })

                    if (
                        !existingInvoice ||
                        !existingInvoice.status ||
                        !existingInvoice.id ||
                        !(typeof existingInvoice.version === 'number')
                    )
                        throwTrpcError(
                            'INTERNAL_SERVER_ERROR',
                            'unable to find existing invoice in square despite enrolment having an invoice id while sending invoice',
                            null,
                            { invoiceData }
                        )

                    const UNCANCELLABLE_STATUSES: InvoiceStatus[] = ['DRAFT', 'PAID', 'REFUNDED', 'CANCELED', 'FAILED']
                    if (!UNCANCELLABLE_STATUSES.includes(existingInvoice.status)) {
                        await square.invoices.cancel({
                            invoiceId: existingInvoice.id,
                            version: existingInvoice.version,
                        })
                    }
                }

                const amount = invoiceData.numberOfWeeks * parseFloat(enrolment.price) * 100 // cents

                // 3. send invoice
                const invoice = await sendInvoice({
                    firstName: enrolment.parent.firstName,
                    lastName: enrolment.parent.lastName,
                    email: enrolment.parent.email,
                    description: `${enrolment.child.firstName} - ${enrolment.className} - ${invoiceData.numberOfWeeks} Weeks`,
                    amount,
                    locationId: getSquareLocationId(enrolment.location),
                    referenceId: enrolment.id,
                    metadata: { programType: enrolment.type === 'science' ? 'science_program' : 'art_program' },
                })

                // 4. store id back into firestore
                const updatedEnrolment: Partial<AfterSchoolEnrolment> = {
                    invoiceId: invoice.id,
                    continuingWithTerm: 'yes',
                    emails: {
                        ...enrolment.emails,
                        continuingEmailSent: true,
                    },
                }

                await DatabaseClient.updateAfterSchoolEnrolment(invoiceData.id, updatedEnrolment)

                const dashboardUrl = env === 'prod' ? 'https://app.squareup.com' : 'https://app.squareupsandbox.com'

                // 5. set the result
                invoiceStatusMap[invoiceData.id] = {
                    status: 'UNPAID',
                    amount,
                    dashboardUrl: `${dashboardUrl}/dashboard/invoices/${invoice.id}`,
                    paymentUrl: invoice.publicUrl!,
                }
            })
        )
        return invoiceStatusMap
    } catch (err) {
        throwTrpcError('INTERNAL_SERVER_ERROR', `error occured sending invoice for an appointment`, err)
    }
}
