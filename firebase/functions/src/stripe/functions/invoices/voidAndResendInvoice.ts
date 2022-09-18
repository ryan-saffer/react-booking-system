import * as StripeConfig from '../../../config/stripe'
import * as functions from 'firebase-functions'
import Stripe from 'stripe'
import { InvoiceStatus, PriceWeekMap, ScienceAppointment, SendInvoiceParamsV2 } from 'fizz-kidz'
import { onCall } from '../../../utilities'
import { PricesMap } from '../../core/pricesMap'
import { db } from '../../../init'
import { sendInvoice } from '../../core/invoicing'
const stripeConfig =
    JSON.parse(process.env.FIREBASE_CONFIG).projectId === 'bookings-prod'
        ? StripeConfig.PROD_CONFIG
        : StripeConfig.DEV_CONFIG
const stripe = new Stripe(stripeConfig.API_KEY, {
    apiVersion: '2020-08-27', // https://stripe.com/docs/api/versioning
})

export const voidAndResendInvoiceV2 = onCall<'voidAndResendInvoiceV2'>(
    async (input: SendInvoiceParamsV2, _context: functions.https.CallableContext) => {
        const { id, price } = input

        // 1. get appointment
        const appointmentRef = db.collection('scienceAppointments').doc(id)
        const appointment = (await (await appointmentRef.get()).data()) as ScienceAppointment

        // 2. void existing invoice
        if (appointment.invoiceId) {
            await stripe.invoices.voidInvoice(appointment.invoiceId)
        }

        // 3. send new invoice
        const invoiceId = await sendInvoice({
            firstName: appointment.parentFirstName,
            lastName: appointment.parentLastName,
            email: appointment.parentEmail,
            phone: appointment.parentPhone,
            description: `${appointment.childFirstName} - ${appointment.className} - ${PriceWeekMap[price]} Weeks`,
            price: PricesMap[price],
            metadata: { programType: 'science_program' }
        })

        // 4. update appointment to include new invoice
        const updatedAppointment: Partial<ScienceAppointment> = {
            invoiceId,
        }
        await appointmentRef.set({ ...updatedAppointment }, { merge: true })

        return { status: InvoiceStatus.UNPAID, url: `${stripeConfig.STRIPE_DASHBOARD}/invoices/${invoiceId}` }
    }
)
