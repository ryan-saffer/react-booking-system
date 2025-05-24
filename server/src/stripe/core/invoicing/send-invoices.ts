import type { AfterSchoolEnrolment, InvoiceStatusMap, SendInvoiceParams } from 'fizz-kidz'

import * as StripeConfig from '../../../config/stripe'
import { DatabaseClient } from '../../../firebase/DatabaseClient'
import { env } from '../../../init'
import { throwTrpcError } from '../../../utilities'
import { StripeClient } from '../stripe-client'
import { retrieveLatestInvoice } from './retrieve-latest-invoice'
import { sendInvoice } from './send-invoice'

const stripeConfig = env === 'prod' ? StripeConfig.PROD_CONFIG : StripeConfig.DEV_CONFIG

export async function sendInvoices(input: SendInvoiceParams[]) {
    const invoiceStatusMap: InvoiceStatusMap = {}
    try {
        const stripe = await StripeClient.getInstance()
        // send one at a time, because sending them all asynchronously leads
        // to very complicated edge cases when sending the same customer multiple invoices
        for (const invoiceData of input) {
            // 1. get enrolment
            const enrolment = await DatabaseClient.getAfterSchoolEnrolment(invoiceData.id)

            // 2. void any existing invoice
            if (enrolment.invoiceId) {
                // first check status, cannot void a paid invoice
                const existingInvoice = await retrieveLatestInvoice(enrolment.invoiceId)
                if (existingInvoice.status === 'open') {
                    await stripe.invoices.voidInvoice(enrolment.invoiceId)
                }
            }

            const amount = invoiceData.numberOfWeeks * parseFloat(enrolment.price) * 100 // cents

            // 3. send invoice
            const invoice = await sendInvoice({
                firstName: enrolment.parent.firstName,
                lastName: enrolment.parent.lastName,
                email: enrolment.parent.email,
                phone: enrolment.parent.phone,
                description: `${enrolment.child.firstName} - ${enrolment.className} - ${invoiceData.numberOfWeeks} Weeks`,
                amount,
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

            // 5. set the result
            invoiceStatusMap[invoiceData.id] = {
                status: 'UNPAID',
                amount,
                dashboardUrl: `${stripeConfig.STRIPE_DASHBOARD}/invoices/${invoice.id}`,
                paymentUrl: invoice.hosted_invoice_url || '',
            }
        }

        return invoiceStatusMap
    } catch (err) {
        throwTrpcError('INTERNAL_SERVER_ERROR', `error occured sending invoice for an appointment`, err)
    }
}
