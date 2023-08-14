import * as StripeConfig from '../../../config/stripe'
import { InvoiceStatusMap, PriceWeekMap, ScienceEnrolment } from 'fizz-kidz'
import { logError, onCall, throwError } from '../../../utilities'
import { PricesMap } from '../../core/pricesMap'
import { getDb, env } from '../../../init'
import { sendInvoice as _sendInvoice } from '../../core/invoicing/sendInvoice'
import { retrieveLatestInvoice } from '../../core/invoicing/retrieveLatestInvoice'
import { getStripeClient } from '../../core/StripeClient'

const stripeConfig = env === 'prod' ? StripeConfig.PROD_CONFIG : StripeConfig.DEV_CONFIG

export const sendInvoices = onCall<'sendInvoices'>(async (input) => {
    const invoiceStatusMap: InvoiceStatusMap = {}
    try {
        const stripe = await getStripeClient()
        const db = await getDb()
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
            const invoice = await _sendInvoice({
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
        logError('error occured sending invoice for an appointment', err, { input })
        throwError('internal', `error occured sending invoice for an appointment`, err)
    }
})
