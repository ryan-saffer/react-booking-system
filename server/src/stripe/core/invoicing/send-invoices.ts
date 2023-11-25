import * as StripeConfig from '../../../config/stripe'

import { InvoiceStatusMap, PriceWeekMap, ScienceEnrolment, SendInvoiceParams } from 'fizz-kidz'

import { FirestoreClient } from '../../../firebase/FirestoreClient'
import { PricesMap } from '../prices-map'
import { StripeClient } from '../stripe-client'
import { env } from '../../../init'
import { retrieveLatestInvoice } from './retrieve-latest-invoice'
import { sendInvoice } from './send-invoice'
import { throwTrpcError } from '../../../utilities'

const stripeConfig = env === 'prod' ? StripeConfig.PROD_CONFIG : StripeConfig.DEV_CONFIG

export async function sendInvoices(input: SendInvoiceParams[]) {
    const invoiceStatusMap: InvoiceStatusMap = {}
    try {
        const stripe = await StripeClient.getInstance()
        const db = await FirestoreClient.getInstance()
        // send one at a time, because sending them all asynchronously leads
        // to very complicated edge cases when sending the same customer multiple invoices
        for (const invoiceData of input) {
            // 1. get enrolment
            const enrolmentRef = db.collection('scienceAppointments').doc(invoiceData.id)
            const enrolment = (await enrolmentRef.get()).data() as ScienceEnrolment

            // 2. void any existing invoice
            if (enrolment.invoiceId) {
                // first check status, cannot void a paid invoice
                const existingInvoice = await retrieveLatestInvoice(enrolment.invoiceId)
                if (existingInvoice.status === 'open') {
                    await stripe.invoices.voidInvoice(enrolment.invoiceId)
                }
            }

            // 3. send invoice
            const invoice = await sendInvoice({
                firstName: enrolment.parent.firstName,
                lastName: enrolment.parent.lastName,
                email: enrolment.parent.email,
                phone: enrolment.parent.phone,
                description: `${enrolment.child.firstName} - ${enrolment.className} - ${
                    PriceWeekMap[invoiceData.price]
                } Weeks`,
                price: PricesMap[invoiceData.price],
                metadata: { programType: 'science_program' },
            })

            // 4. store id back into firestore
            const updatedEnrolment: Partial<ScienceEnrolment> = {
                invoiceId: invoice.id,
                continuingWithTerm: 'yes',
                emails: {
                    ...enrolment.emails,
                    continuingEmailSent: true,
                },
            }
            await enrolmentRef.update(updatedEnrolment)

            // 5. set the result
            invoiceStatusMap[invoiceData.id] = {
                status: 'UNPAID',
                amount: parseInt(invoiceData.price) * 100,
                dashboardUrl: `${stripeConfig.STRIPE_DASHBOARD}/invoices/${invoice.id}`,
                paymentUrl: invoice.hosted_invoice_url || '',
            }
        }

        return invoiceStatusMap
    } catch (err) {
        throwTrpcError('INTERNAL_SERVER_ERROR', `error occured sending invoice for an appointment`, err)
    }
}
