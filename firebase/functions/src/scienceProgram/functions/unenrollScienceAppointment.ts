import * as functions from 'firebase-functions'
import { db } from '../../init'
import { onCall } from '../../utilities'
import { ScienceAppointment, UnenrollScienceAppointmentParams } from 'fizz-kidz'
import { AcuityClient } from '../../acuity/AcuityClient'
import { MailClient } from '../../sendgrid/MailClient'

export const unenrollScienceAppointment = onCall<'unenrollScienceAppointment'>(
    async (input: UnenrollScienceAppointmentParams, _context: functions.https.CallableContext) => {
        const { appointmentId } = input

        // 1. get appointment from firestore
        const appointmentSnapshot = await db.collection('scienceAppointments').doc(appointmentId).get()
        const appointment = appointmentSnapshot.data() as ScienceAppointment

        // 2. cancel each acuity appointment
        let appointmentIds = appointment.appointments

        try {
            await new AcuityClient().unenrollChildFromTerm(appointmentIds)
        } catch (err) {
            throw new functions.https.HttpsError(
                'internal',
                `error unenrolling from term. firestore id: ${appointmentId}`,
                err
            )
        }

        const updatedAppointment: Partial<ScienceAppointment> = {
            status: 'inactive',
        }

        // 3. set status to 'unenrolled'
        await appointmentSnapshot.ref.set(updatedAppointment, { merge: true })

        // 4. email confirmation
        try {
            await new MailClient().sendEmail('scienceTermUnenrolmentConfirmation', appointment.parentEmail, {
                parentName: appointment.parentFirstName,
                childName: appointment.childFirstName,
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
