import { Acuity } from 'fizz-kidz'
import { DateTime } from 'luxon'
import { mailClient } from '../../sendgrid/MailClient'
import { Emails } from '../../sendgrid/types'
import * as functions from 'firebase-functions'
import { AcuityClient } from '../../acuity/core/AcuityClient'
import HolidayProgramBooking = Acuity.Client.HolidayProgramBooking
import { FirestoreClient } from '../../firebase/FirestoreClient'

export async function bookHolidayPrograms(paymentIntentId: string) {
    let query = await FirestoreClient.getHolidayProgramBooking(paymentIntentId)

    console.log('query exists', query.exists)
    console.log('query booked', query.get('booked'))

    if (query.exists && !query.get('booked')) {
        let programsSnapshot = await FirestoreClient.getHolidayPrograms(paymentIntentId)
        await scheduleHolidayPrograms(programsSnapshot, paymentIntentId)
        await FirestoreClient.updateHolidayProgramBooking(paymentIntentId, { booked: true })
    }
}

async function scheduleHolidayPrograms(
    programs: FirebaseFirestore.QuerySnapshot<HolidayProgramBooking>,
    paymentIntentId: string
) {
    const promises = programs.docs.map((program) => scheduleHolidayProgram(program, paymentIntentId))

    try {
        // once all booked, send confirmation email
        let result = await Promise.all(promises)

        let bookings: Emails['holidayProgramConfirmation']['bookings'] = []
        let sortedAppointments = result.sort((a, b) => {
            const child1Name = Acuity.Utilities.retrieveFormAndField(
                a,
                Acuity.Constants.Forms.CHILDREN_DETAILS,
                Acuity.Constants.FormFields.CHILDREN_NAMES
            )
            const child2Name = Acuity.Utilities.retrieveFormAndField(
                b,
                Acuity.Constants.Forms.CHILDREN_DETAILS,
                Acuity.Constants.FormFields.CHILDREN_NAMES
            )
            return a.datetime < b.datetime ? -1 : a.datetime > b.datetime ? 1 : child1Name < child2Name ? 1 : -1
        })
        sortedAppointments.forEach((appointment) => {
            const dateTime = DateTime.fromISO(appointment.datetime, {
                setZone: true,
            }).toLocaleString({
                weekday: 'long',
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            })
            bookings.push({
                datetime: `${Acuity.Utilities.retrieveFormAndField(
                    appointment,
                    Acuity.Constants.Forms.CHILDREN_DETAILS,
                    Acuity.Constants.FormFields.CHILDREN_NAMES
                )} - ${dateTime}`,
                confirmationPage: appointment.confirmationPage,
            })
        })

        await mailClient.sendEmail('holidayProgramConfirmation', result[0].email, {
            parentName: result[0].firstName,
            location: `Fizz Kidz ${result[0].calendar}`,
            address: result[0].location,
            bookings,
        })
        return true
    } catch (error) {
        console.error(error)
        throw new functions.https.HttpsError('internal', 'error booking into acuity', error)
    }
}

async function scheduleHolidayProgram(
    programSnapshot: FirebaseFirestore.QueryDocumentSnapshot<HolidayProgramBooking>,
    paymentIntentId: string
): Promise<Acuity.Appointment> {
    const program = programSnapshot.data()

    if (program.booked) {
        return AcuityClient.getAppointment(program.appointmentId.toString())
    }

    const appointment = await AcuityClient.scheduleAppointment({
        appointmentTypeID: program.appointmentTypeId,
        datetime: program.dateTime,
        calendarID: program.calendarId,
        firstName: program.parentFirstName,
        lastName: program.parentLastName,
        email: program.parentEmail,
        phone: program.parentPhone,
        paid: true,
        certificate: program.discountCode,
        fields: [
            {
                id: Acuity.Constants.FormFields.CHILDREN_NAMES,
                value: program.childName,
            },
            {
                id: Acuity.Constants.FormFields.CHILDREN_AGES,
                value: program.childAge,
            },
            {
                id: Acuity.Constants.FormFields.CHILDREN_ALLERGIES,
                value: program.childAllergies,
            },
            {
                id: Acuity.Constants.FormFields.EMERGENCY_CONTACT_NAME_HP,
                value: program.emergencyContactName,
            },
            {
                id: Acuity.Constants.FormFields.EMERGENCY_CONTACT_NUMBER_HP,
                value: program.emergencyContactPhone,
            },
            {
                id: Acuity.Constants.FormFields.HOLIDAY_PROGRAM_PAYMENT_INTENT_ID,
                value: paymentIntentId,
            },
            {
                id: Acuity.Constants.FormFields.HOLIDAY_PROGRAM_AMOUNT_CHARGED,
                value: program.amountCharged,
            },
        ],
    })

    const result = await FirestoreClient.updateHolidayProgram(paymentIntentId, programSnapshot.id, {
        booked: true,
        appointmentId: appointment.id,
    })

    console.log({ result })

    return appointment
}
