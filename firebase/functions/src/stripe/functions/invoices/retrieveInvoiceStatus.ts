import * as StripeConfig from '../../../config/stripe'
import * as functions from 'firebase-functions'
import Stripe from 'stripe'
import { RetrieveInvoiceStatusParams, ScienceEnrolment } from 'fizz-kidz'
import { onCall } from '../../../utilities'
import { db } from '../../../init'
const stripeConfig =
    JSON.parse(process.env.FIREBASE_CONFIG).projectId === 'bookings-prod'
        ? StripeConfig.PROD_CONFIG
        : StripeConfig.DEV_CONFIG
const stripe = new Stripe(stripeConfig.API_KEY, {
    apiVersion: '2020-08-27', // https://stripe.com/docs/api/versioning
})

export const retrieveInvoiceStatus = onCall<'retrieveInvoiceStatus'>(
    async (data: RetrieveInvoiceStatusParams, _context: functions.https.CallableContext) => {
        const { appointmentId } = data

        const appointment = (
            await db.collection('scienceAppointments').doc(appointmentId).get()
        ).data() as ScienceEnrolment

        if (!appointment.invoiceId) {
            return { status: 'NOT_SENT' }
        } else {
            // invoice already created... check its status
            let invoice = await stripe.invoices.retrieve(appointment.invoiceId)
            const url = `${stripeConfig.STRIPE_DASHBOARD}/invoices/${invoice.id}`
            if (invoice.paid) {
                return {
                    status: 'PAID',
                    amount: invoice.amount_due,
                    dashboardUrl: url,
                    paymentUrl: invoice.hosted_invoice_url || '',
                }
            } else {
                return {
                    status: 'UNPAID',
                    amount: invoice.amount_due,
                    dashboardUrl: url,
                    paymentUrl: invoice.hosted_invoice_url || '',
                }
            }
        }
    }
)
