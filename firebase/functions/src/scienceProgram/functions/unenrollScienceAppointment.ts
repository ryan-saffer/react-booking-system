import * as functions from 'firebase-functions'
import { db } from '../../init'
import { onCall } from '../../utilities'
import { ScienceAppointment, UnenrollScienceAppointmentParams } from 'fizz-kidz'
import { AcuityClient } from '../../acuity/AcuityClient'

export const unenrollScienceAppointment = onCall<'unenrollScienceAppointment'>(
    async (input: UnenrollScienceAppointmentParams, _context: functions.https.CallableContext) => {
        const { appointmentId } = input

        // 1. get appointment from firestore
        const appointmentSnapshot = await db.collection('scienceAppointments').doc(appointmentId).get()
        const appointment = appointmentSnapshot.data() as ScienceAppointment

        // 2. cancel each acuity appointment
        let appointmentIds = appointment.appointments

        let acuityClient = new AcuityClient()

        try {
            await acuityClient.unenrollChildFromTerm(appointmentIds)
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
    }
)
