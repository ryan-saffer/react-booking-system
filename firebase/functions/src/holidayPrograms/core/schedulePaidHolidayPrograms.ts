import { Acuity, PaidHolidayProgramBooking } from 'fizz-kidz'
import * as functions from 'firebase-functions'
import { AcuityClient } from '../../acuity/core/AcuityClient'
import { FirestoreClient } from '../../firebase/FirestoreClient'
import { scheduleHolidayProgram } from './scheduleHolidayProgram'
import { sendConfirmationEmail } from './sendConfirmationEmail'

export async function bookHolidayPrograms(paymentIntentId: string) {
    const query = await FirestoreClient.getHolidayProgramBooking(paymentIntentId)

    console.log('query exists', query.exists)
    console.log('query booked', query.get('booked'))

    if (query.exists && !query.get('booked')) {
        const programsSnapshot = await FirestoreClient.getHolidayPrograms(paymentIntentId)
        await scheduleHolidayPrograms(programsSnapshot, paymentIntentId)
        await FirestoreClient.updateHolidayProgramBooking(paymentIntentId, { booked: true })
    }
}

async function scheduleHolidayPrograms(
    programs: FirebaseFirestore.QuerySnapshot<PaidHolidayProgramBooking>,
    paymentIntentId: string
) {
    try {
        // book in all programs
        const result = await Promise.all(
            programs.docs.map((program) => _scheduleHolidayProgram(program, paymentIntentId))
        )

        // send confirmation email
        await sendConfirmationEmail(result)

        return true
    } catch (error) {
        functions.logger.error(error)
        throw new functions.https.HttpsError('internal', 'error booking into acuity', error)
    }
}

async function _scheduleHolidayProgram(
    programSnapshot: FirebaseFirestore.QueryDocumentSnapshot<PaidHolidayProgramBooking>,
    paymentIntentId: string
): Promise<Acuity.Appointment> {
    const program = programSnapshot.data()

    if (program.booked) {
        return AcuityClient.getAppointment(program.appointmentId.toString())
    }

    const appointment = await scheduleHolidayProgram(program, paymentIntentId)

    await FirestoreClient.updateHolidayProgram(paymentIntentId, programSnapshot.id, {
        booked: true,
        appointmentId: appointment.id,
    })

    return appointment
}
