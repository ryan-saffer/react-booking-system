import * as functions from 'firebase-functions'
import { db } from '../../init'
import { onCall } from '../../utilities'
import { ScienceEnrolment, UnenrollScienceAppointmentParams } from 'fizz-kidz'
import { AcuityClient } from '../../acuity/AcuityClient'
import { mailClient } from '../../sendgrid/MailClient'

export const unenrollScienceAppointment = onCall<'unenrollScienceAppointment'>(
    async (input: UnenrollScienceAppointmentParams, _context: functions.https.CallableContext) => {
        const { appointmentId } = input

        // 1. get appointment from firestore
        const appointmentSnapshot = await db.collection('scienceAppointments').doc(appointmentId).get()
        const appointment = appointmentSnapshot.data() as ScienceEnrolment

        // 2. cancel each acuity appointment
        let appointmentIds = appointment.appointments

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

        const updatedAppointment: Partial<ScienceEnrolment> = {
            status: 'inactive',
        }

        // 3. set status to 'unenrolled'
        await appointmentSnapshot.ref.set(updatedAppointment, { merge: true })

        // 4. email confirmation
        try {
            await mailClient.sendEmail('scienceTermUnenrolmentConfirmation', appointment.parent.email, {
                parentName: appointment.parent.firstName,
                childName: appointment.child.firstName,
                className: appointment.className,
            })
        } catch (err) {
            functions.logger.error('error sending unenrolment confirmation', err)
            throw new functions.https.HttpsError(
                'internal',
                'appointment cancelled, however an error occurred sending the confirmation email',
                err
            )
        }
    }
)
