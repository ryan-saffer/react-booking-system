import { logError, onCall, throwError } from '../../utilities'
import { ScienceEnrolment } from 'fizz-kidz'
import { AcuityClient } from '../../acuity/core/AcuityClient'
import { getMailClient } from '../../sendgrid/MailClient'
import { retrieveLatestInvoice } from '../../stripe/core/invoicing/retrieveLatestInvoice'
import { FirestoreClient } from '../../firebase/FirestoreClient'
import { getStripeClient } from '../../stripe/core/StripeClient'

export const unenrollScienceAppointments = onCall<'unenrollScienceAppointments'>(async (input) => {
    await Promise.all(
        input.appointmentIds.map(async (appointmentId) => {
            // 1. get appointment from firestore
            const enrolment = await FirestoreClient.getScienceEnrolment(appointmentId)

            // 2. cancel each acuity appointment
            const appointmentIds = enrolment.appointments

            try {
                await Promise.all(appointmentIds.map((id) => AcuityClient.cancelAppointment(id)))
            } catch (err) {
                logError('error unenrolling from term.', err, { input })
                throwError('internal', `error unenrolling from term. firestore id: ${appointmentId}`, err)
            }

            // 3. void invoice if needed
            if (enrolment.invoiceId) {
                const invoice = await retrieveLatestInvoice(enrolment.invoiceId)
                if (invoice.status === 'open') {
                    await getStripeClient().invoices.voidInvoice(invoice.id!)
                }
            }

            // 4. set status to 'unenrolled'
            const updatedAppointment: Partial<ScienceEnrolment> = {
                status: 'inactive',
            }
            await FirestoreClient.updateScienceEnrolment(appointmentId, updatedAppointment)

            // 5. email confirmation
            try {
                await getMailClient().sendEmail('scienceTermUnenrolmentConfirmation', enrolment.parent.email, {
                    parentName: enrolment.parent.firstName,
                    childName: enrolment.child.firstName,
                    className: enrolment.className,
                })
            } catch (err) {
                logError('error sending unenrolment confirmation', err)
                throwError(
                    'internal',
                    `appointment with id ${appointmentId} cancelled, however an error occurred sending the confirmation email`,
                    err
                )
            }
        })
    )
})
