import * as functions from 'firebase-functions'
import { db, stripe } from '../../init'
import { onCall } from '../../utilities'
import { ScienceEnrolment, UnenrollScienceAppointmentsParams } from 'fizz-kidz'
import { AcuityClient } from '../../acuity/AcuityClient'
import { mailClient } from '../../sendgrid/MailClient'
import { retrieveLatestInvoice } from '../../stripe/core/invoicing/retrieveLatestInvoice'

export const unenrollScienceAppointments = onCall<'unenrollScienceAppointments'>(
    async (input: UnenrollScienceAppointmentsParams, _context: functions.https.CallableContext) => {
        await Promise.all(
            input.appointmentIds.map(async (appointmentId) => {
                // 1. get appointment from firestore
                const enrolmentSnapshot = await db.collection('scienceAppointments').doc(appointmentId).get()
                const enrolment = enrolmentSnapshot.data() as ScienceEnrolment

                // 2. cancel each acuity appointment
                let appointmentIds = enrolment.appointments

                try {
                    const acuityClient = new AcuityClient()
                    await Promise.all(appointmentIds.map((id) => acuityClient.cancelAppointment(id)))
                } catch (err) {
                    throw new functions.https.HttpsError(
                        'internal',
                        `error unenrolling from term. firestore id: ${appointmentId}`,
                        err
                    )
                }

                // 3. set status to 'unenrolled'
                const updatedAppointment: Partial<ScienceEnrolment> = {
                    status: 'inactive',
                }
                await enrolmentSnapshot.ref.update(updatedAppointment)

                // 4. void invoice if needed
                if (enrolment.invoiceId) {
                    const invoice = await retrieveLatestInvoice(enrolment.invoiceId)
                    if (invoice.status === 'open') {
                        await stripe.invoices.voidInvoice(enrolment.invoiceId)
                    }
                }

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
