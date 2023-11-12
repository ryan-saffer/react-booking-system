import { AcuityUtilities, PaidHolidayProgramBooking } from 'fizz-kidz'
import { DatabaseClient } from '../../firebase/DatabaseClient'
import { scheduleHolidayProgram } from './scheduleHolidayProgram'
import { sendConfirmationEmail } from './sendConfirmationEmail'
import { FirestoreRefs } from '../../firebase/FirestoreRefs'
import { logError } from '../../utilities'
import { AcuityClient } from '../../acuity/core/AcuityClient'
import { HubspotClient } from '../../hubspot/HubspotClient'
import { logger } from 'firebase-functions/v2'

export async function bookHolidayPrograms(paymentIntentId: string) {
    const query = await (await FirestoreRefs.holidayProgramBooking(paymentIntentId)).get()

    logger.log('query exists', query.exists)
    logger.log('query booked', query.get('booked'))

    if (query.exists && !query.get('booked')) {
        const programs = (await DatabaseClient.getHolidayPrograms(paymentIntentId)).docs.map((doc) => ({
            program: doc.data(),
            id: doc.id,
        }))
        await scheduleHolidayPrograms(programs, paymentIntentId)
        await DatabaseClient.updateHolidayProgramBooking(paymentIntentId, { booked: true })
    }
}

async function scheduleHolidayPrograms(
    programs: { program: PaidHolidayProgramBooking; id: string }[],
    paymentIntentId: string
) {
    // book in all programs
    const result = await Promise.all(programs.map((it) => _scheduleHolidayProgram(it.program, it.id, paymentIntentId)))

    try {
        const hubspotClient = await HubspotClient.getInstance()
        const program = programs[0]
        if (program) {
            const { parentFirstName, parentLastName, parentEmail, parentPhone, calendarId } = program.program
            await hubspotClient.addHolidayProgramContact({
                firstName: parentFirstName,
                lastName: parentLastName,
                email: parentEmail,
                mobile: parentPhone,
                location: AcuityUtilities.getStudioByCalendarId(calendarId),
            })
        }
    } catch (err) {
        logError(`unable to add holiday program booking to hubspot with paymentIntentId ${paymentIntentId}`, err)
    }
    // send confirmation email
    await sendConfirmationEmail(result)

    return true
}

async function _scheduleHolidayProgram(program: PaidHolidayProgramBooking, id: string, paymentIntentId: string) {
    if (program.booked) {
        const acuity = await AcuityClient.getInstance()
        return acuity.getAppointment(program.appointmentId.toString())
    }

    const appointment = await scheduleHolidayProgram(program, paymentIntentId)

    await DatabaseClient.updateHolidayProgram(paymentIntentId, id, {
        booked: true,
        appointmentId: appointment.id,
    })

    return appointment
}
