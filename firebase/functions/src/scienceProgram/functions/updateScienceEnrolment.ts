import * as functions from 'firebase-functions'
import { UpdateScienceEnrolmentParams, ScienceAppointment } from 'fizz-kidz'
import { db } from '../../init'
import { onCall } from '../../utilities'

export const updateScienceEnrolment = onCall<'updateScienceEnrolment'>(
    async (input: UpdateScienceEnrolmentParams, _context: functions.https.CallableContext) => {
        const { appointmentId, ...updatedAppointment } = input

        const appointmentRef = db.collection('scienceAppointments').doc(appointmentId)

        await appointmentRef.set(updatedAppointment, { merge: true })
        const appointment = (await appointmentRef.get()).data() as ScienceAppointment

        return appointment
    }
)
