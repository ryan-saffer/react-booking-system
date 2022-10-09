import * as StripeConfig from '../../../config/stripe'
import * as functions from 'firebase-functions'
import { PriceWeekMap, ScienceEnrolment, SendInvoiceParams } from 'fizz-kidz'
import { onCall } from '../../../utilities'
import { PricesMap } from '../../core/pricesMap'
import { db } from '../../../init'
import { sendInvoice as _sendInvoice } from '../../core/invoicing'
const stripeConfig =
    JSON.parse(process.env.FIREBASE_CONFIG).projectId === 'bookings-prod'
        ? StripeConfig.PROD_CONFIG
        : StripeConfig.DEV_CONFIG

export const sendInvoice = onCall<'sendInvoice'>(
    async (input: SendInvoiceParams, _context: functions.https.CallableContext) => {
        const { id, price } = input

        try {
            // 1. get appointment
            const appointmentRef = db.collection('scienceAppointments').doc(id)
            const appointment = (await appointmentRef.get()).data() as ScienceEnrolment

            // 2. send invoice
            const invoice = await _sendInvoice({
                firstName: appointment.parent.firstName,
                lastName: appointment.parent.lastName,
                email: appointment.parent.email,
                phone: appointment.parent.phone,
                description: `${appointment.child.firstName} - ${appointment.className} - ${PriceWeekMap[price]} Weeks`,
                price: PricesMap[price],
                metadata: { programType: 'science_program' },
            })

            // 3. store id back into firestore
            const updatedAppointment: Partial<ScienceEnrolment> = {
                invoiceId: invoice.id,
                continuingWithTerm: 'yes',
                emails: {
                    ...appointment.emails,
                    continuingEmailSent: true,
                },
            }
            await appointmentRef.set({ ...updatedAppointment }, { merge: true })

            // 4. return result
            return {
                status: 'UNPAID',
                amount: parseInt(price) * 100,
                dashboardUrl: `${stripeConfig.STRIPE_DASHBOARD}/invoices/${invoice.id}`,
                paymentUrl: invoice.hosted_invoice_url || '',
            }
        } catch (err) {
            throw new functions.https.HttpsError(
                'internal',
                `error occured sending invoice for appointment: ${id}`,
                err
            )
        }
    }
)
