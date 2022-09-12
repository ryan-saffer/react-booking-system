import * as StripeConfig from '../../../config/stripe'
import * as functions from 'firebase-functions'
import { InvoiceStatus, PriceWeekMap, ScienceAppointment, SendInvoiceParamsV2 } from 'fizz-kidz'
import { onCall } from '../../../utilities'
import { PricesMap } from '../../core/pricesMap'
import { db } from '../../../init'
import { sendInvoice } from '../../core/invoicing'
const stripeConfig =
    JSON.parse(process.env.FIREBASE_CONFIG).projectId === 'bookings-prod'
        ? StripeConfig.PROD_CONFIG
        : StripeConfig.DEV_CONFIG

export const sendInvoiceV2 = onCall<'sendInvoiceV2'>(
    async (input: SendInvoiceParamsV2, _context: functions.https.CallableContext) => {
        const { id, price } = input

        try {
            // 1. get appointment
            const appointmentRef = db.collection('scienceAppointments').doc(id)
            const appointment = (await (await appointmentRef.get()).data()) as ScienceAppointment

            // 2. send invoice
            const invoiceId = await sendInvoice({
                firstName: appointment.parentFirstName,
                lastName: appointment.parentLastName,
                email: appointment.parentEmail,
                phone: appointment.parentPhone,
                description: `${appointment.childName} - ${appointment.className} - ${PriceWeekMap[price]} Weeks`,
                price: PricesMap[price],
            })

            // 3. store id back into firestore
            const updatedAppointment: Partial<ScienceAppointment> = {
                invoiceId,
                continuingWithTerm: 'yes',
                continuingEmailSent: true,
            }
            await appointmentRef.set({ ...updatedAppointment }, { merge: true })

            // 4. return result
            return { status: InvoiceStatus.UNPAID, url: `${stripeConfig.STRIPE_DASHBOARD}/invoices/${invoiceId}` }
        } catch (err) {
            throw new functions.https.HttpsError(
                'internal',
                `error occured sending invoice for appointment: ${id}`,
                err
            )
        }
    }
)
