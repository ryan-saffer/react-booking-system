import * as functions from 'firebase-functions'
import { stripe } from '../../init'
import { onCall } from '../../utilities'
import { ScienceEnrolment, UnenrollScienceAppointmentsParams } from 'fizz-kidz'
import { AcuityClient } from '../../acuity/core/AcuityClient'
import { mailClient } from '../../sendgrid/MailClient'
import { retrieveLatestInvoice } from '../../stripe/core/invoicing/retrieveLatestInvoice'
import { FirestoreClient } from '../../firebase/FirestoreClient'

export const unenrollScienceAppointments = onCall<'unenrollScienceAppointments'>(
    async (input: UnenrollScienceAppointmentsParams, _context: functions.https.CallableContext) => {
        await Promise.all(
            input.appointmentIds.map(async (appointmentId) => {
                // 1. get appointment from firestore
                const enrolmentSnapshot = await FirestoreClient.getScienceEnrolment(appointmentId)
                const enrolment = enrolmentSnapshot.data()!

                // 2. cancel each acuity appointment
                let appointmentIds = enrolment.appointments

                try {
                    await Promise.all(appointmentIds.map((id) => AcuityClient.cancelAppointment(id)))
                } catch (err) {
                    throw new functions.https.HttpsError(
                        'internal',
                        `error unenrolling from term. firestore id: ${appointmentId}`,
                        err
                    )
                }

                // 3. void invoice if needed
                if (enrolment.invoiceId) {
                    const invoice = await retrieveLatestInvoice(enrolment.invoiceId)
                    if (invoice.status === 'open') {
                        await stripe.invoices.voidInvoice(invoice.id!)
                    }
                }

                // 4. set status to 'unenrolled'
                const updatedAppointment: Partial<ScienceEnrolment> = {
                    status: 'inactive',
                }
                await enrolmentSnapshot.ref.update(updatedAppointment)

                // 5. email confirmation
                try {
                    await mailClient.sendEmail('scienceTermUnenrolmentConfirmation', enrolment.parent.email, {
                        parentName: enrolment.parent.firstName,
                        childName: enrolment.child.firstName,
                        className: enrolment.className,
                    })
                } catch (err) {
                    functions.logger.error('error sending unenrolment confirmation', err)
                    throw new functions.https.HttpsError(
                        'internal',
                        `appointment with id ${appointmentId} cancelled, however an error occurred sending the confirmation email`,
                        err
                    )
                }
            })
        )
    }
)
