import { Acuity, PaidHolidayProgramBooking } from 'fizz-kidz'
import * as functions from 'firebase-functions'
import { AcuityClient } from '../../acuity/core/AcuityClient'
import { FirestoreClient } from '../../firebase/FirestoreClient'
import { scheduleHolidayProgram } from './scheduleHolidayProgram'
import { sendConfirmationEmail } from './sendConfirmationEmail'
import { FirestoreRefs } from '../../firebase/FirestoreRefs'
import { getHubspotClient } from '../../hubspot/HubspotClient'

export async function bookHolidayPrograms(paymentIntentId: string) {
    const query = await FirestoreRefs.holidayProgramBooking(paymentIntentId).get()

    console.log('query exists', query.exists)
    console.log('query booked', query.get('booked'))

    if (query.exists && !query.get('booked')) {
        const programs = (await FirestoreClient.getHolidayPrograms(paymentIntentId)).docs.map((doc) => ({
            program: doc.data(),
            id: doc.id,
        }))
        await scheduleHolidayPrograms(programs, paymentIntentId)
        await FirestoreClient.updateHolidayProgramBooking(paymentIntentId, { booked: true })
    }
}

async function scheduleHolidayPrograms(
    programs: { program: PaidHolidayProgramBooking; id: string }[],
    paymentIntentId: string
) {
    // book in all programs
    const result = await Promise.all(programs.map((it) => _scheduleHolidayProgram(it.program, it.id, paymentIntentId)))

    try {
        const hubspotClient = getHubspotClient()
        const program = programs[0]
        if (program) {
            const { parentFirstName, parentLastName, parentEmail, parentPhone, calendarId } = program.program
            await hubspotClient.addHolidayProgramContact({
                firstName: parentFirstName,
                lastName: parentLastName,
                email: parentEmail,
                mobile: parentPhone,
                location: Acuity.Utilities.getStudioByCalendarId(calendarId),
            })
        }
    } catch (err) {
        functions.logger.error(
            `unable to add holiday program booking to hubspot with paymentIntentId ${paymentIntentId}`,
            { details: err }
        )
    }
    // send confirmation email
    await sendConfirmationEmail(result)

    return true
}

async function _scheduleHolidayProgram(
    program: PaidHolidayProgramBooking,
    id: string,
    paymentIntentId: string
): Promise<Acuity.Appointment> {
    if (program.booked) {
        return AcuityClient.getAppointment(program.appointmentId.toString())
    }

    const appointment = await scheduleHolidayProgram(program, paymentIntentId)

    await FirestoreClient.updateHolidayProgram(paymentIntentId, id, {
        booked: true,
        appointmentId: appointment.id,
    })

    return appointment
}
