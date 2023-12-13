import { ScienceEnrolment, UnenrollScienceAppointmentsParams } from 'fizz-kidz'

import { AcuityClient } from '../../acuity/core/acuity-client'
import { DatabaseClient } from '../../firebase/DatabaseClient'
import { MailClient } from '../../sendgrid/MailClient'
import { retrieveLatestInvoice } from '../../stripe/core/invoicing/retrieve-latest-invoice'
import { StripeClient } from '../../stripe/core/stripe-client'
import { throwTrpcError } from '../../utilities'

export async function unenrollScienceAppointments(input: UnenrollScienceAppointmentsParams) {
    await Promise.all(
        input.appointmentIds.map(async (appointmentId) => {
            // 1. get appointment from firestore
            const enrolment = await DatabaseClient.getScienceEnrolment(appointmentId)

            // 2. cancel each acuity appointment
            const appointmentIds = enrolment.appointments

            try {
                const acuity = await AcuityClient.getInstance()
                await Promise.all(appointmentIds.map((id) => acuity.cancelAppointment(id)))
            } catch (err) {
                throwTrpcError(
                    'INTERNAL_SERVER_ERROR',
                    `error unenrolling from term. firestore id: ${appointmentId}`,
                    err
                )
            }

            // 3. void invoice if needed
            if (enrolment.invoiceId) {
                const invoice = await retrieveLatestInvoice(enrolment.invoiceId)
                if (invoice.status === 'open') {
                    const stripe = await StripeClient.getInstance()
                    await stripe.invoices.voidInvoice(invoice.id!)
                }
            }

            // 4. set status to 'unenrolled'
            const updatedAppointment: Partial<ScienceEnrolment> = {
                status: 'inactive',
            }
            await DatabaseClient.updateScienceEnrolment(appointmentId, updatedAppointment)

            // 5. email confirmation
            try {
                const mailClient = await MailClient.getInstance()
                await mailClient.sendEmail('scienceTermUnenrolmentConfirmation', enrolment.parent.email, {
                    parentName: enrolment.parent.firstName,
                    childName: enrolment.child.firstName,
                    className: enrolment.className,
                })
            } catch (err) {
                throwTrpcError(
                    'INTERNAL_SERVER_ERROR',
                    `appointment with id ${appointmentId} cancelled, however an error occurred sending the confirmation email`,
                    err
                )
            }
        })
    )
}