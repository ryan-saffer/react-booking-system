import {
    getSquareLocationId,
    type InvoiceStatusMap,
    type PreschoolProgramEnrolment,
    type SendPreschoolProgramInvoiceParams,
} from 'fizz-kidz'

import { DatabaseClient } from '@/firebase/DatabaseClient'
import { env } from '@/init'
import { SquareClient } from '@/square/core/square-client'
import { throwTrpcError } from '@/utilities'

import { getPreschoolProgramInvoiceCatalogObjectId } from './preschool-program-invoice-config'
import { sendPreschoolProgramInvoice } from './send-preschool-program-invoice'

import type { InvoiceStatus } from 'square/api'

export async function sendPreschoolProgramInvoices(input: SendPreschoolProgramInvoiceParams[]) {
    const invoiceStatusMap: InvoiceStatusMap = {}

    try {
        const square = await SquareClient.getInstance()
        const catalogObjectId = getPreschoolProgramInvoiceCatalogObjectId()

        await Promise.all(
            input.map(async (invoiceData) => {
                const enrolment = await DatabaseClient.getPreschoolProgramEnrolment(invoiceData.id)

                if (enrolment.invoiceId) {
                    const { invoice: existingInvoice } = await square.invoices.get({
                        invoiceId: enrolment.invoiceId,
                    })

                    if (
                        !existingInvoice ||
                        !existingInvoice.status ||
                        !existingInvoice.id ||
                        !(typeof existingInvoice.version === 'number')
                    ) {
                        throwTrpcError(
                            'INTERNAL_SERVER_ERROR',
                            'unable to find existing Preschool Program invoice in square despite enrolment having an invoice id while sending invoice',
                            null,
                            { invoiceData }
                        )
                    }

                    if (existingInvoice.status === 'PAID' || existingInvoice.status === 'PARTIALLY_REFUNDED') {
                        throwTrpcError(
                            'PRECONDITION_FAILED',
                            'Cannot send a new Preschool Program invoice for an enrolment that has already been paid.',
                            null,
                            { invoiceData, existingInvoiceId: existingInvoice.id }
                        )
                    }

                    const uncancellableStatuses: InvoiceStatus[] = ['DRAFT', 'PAID', 'REFUNDED', 'CANCELED', 'FAILED']
                    if (!uncancellableStatuses.includes(existingInvoice.status)) {
                        await square.invoices.cancel({
                            invoiceId: existingInvoice.id,
                            version: existingInvoice.version,
                        })
                    }
                }

                const amount = invoiceData.numberOfWeeks * parseFloat(enrolment.price) * 100

                const invoice = await sendPreschoolProgramInvoice({
                    firstName: enrolment.parent.firstName,
                    lastName: enrolment.parent.lastName,
                    email: enrolment.parent.email,
                    description: `${enrolment.child.firstName} - ${enrolment.className} - ${invoiceData.numberOfWeeks} Weeks`,
                    amount,
                    locationId: getSquareLocationId(enrolment.studio),
                    referenceId: enrolment.id,
                    catalogObjectId,
                })

                const updatedEnrolment: Partial<PreschoolProgramEnrolment> = {
                    invoiceId: invoice.id,
                }

                await DatabaseClient.updatePreschoolProgramEnrolment(invoiceData.id, updatedEnrolment)

                const dashboardUrl = env === 'prod' ? 'https://app.squareup.com' : 'https://app.squareupsandbox.com'

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
        throwTrpcError('INTERNAL_SERVER_ERROR', 'error occurred sending Preschool Program invoice', err)
    }
}
