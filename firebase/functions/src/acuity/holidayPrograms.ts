import { Acuity } from 'fizz-kidz'
import { DateTime } from 'luxon'
import { MailClient } from '../sendgrid/EmailClient'
import { Emails } from '../sendgrid/types'
import { hasError } from './shared'
import { db } from '..'
import * as functions from 'firebase-functions'
const AcuitySdk = require('acuityscheduling')
const acuityCredentials = require('../../credentials/acuity_credentials.json')

const acuity = AcuitySdk.basic({
    userId: acuityCredentials.user_id,
    apiKey: acuityCredentials.api_key,
})

export async function bookHolidayPrograms(paymentIntentId: string) {

    console.log('Acuity userId:', acuityCredentials.user_id)
    let query = await db.collection('holidayProgramBookings').doc(paymentIntentId).get()

    console.log('query exists', query.exists)
    console.log('query booked', query.get('booked'))

    if (query.exists && !query.get('booked')) {
        let programsSnapshot = await db
            .collection('holidayProgramBookings')
            .doc(paymentIntentId)
            .collection('programs')
            .get()

        let programs: Acuity.Client.HolidayProgramBooking[] = []
        programsSnapshot.forEach((program) => programs.push(program.data() as Acuity.Client.HolidayProgramBooking))
        await scheduleHolidayPrograms(programs, paymentIntentId)

        await db.collection('holidayProgramBookings').doc(paymentIntentId).set({ booked: true })
    }
}

async function scheduleHolidayPrograms(programs: Acuity.Client.HolidayProgramBooking[], paymentIntentId: string) {
    let promises: Promise<Acuity.Appointment>[] = []
    programs.forEach((program) => {
        promises.push(
            new Promise((resolve, reject) => {
                scheduleHolidayProgram(program, paymentIntentId)
                    .then((appointment) => resolve(appointment as Acuity.Appointment))
                    .catch((err) => reject(err))
            })
        )
    })
    try {
        // once all booked, send confirmation email
        let result = await Promise.all(promises)
        const mailClient = new MailClient()

        let bookings: Emails['holidayProgramConfirmation']['values']['bookings'] = []
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

        const emailInfo: Emails['holidayProgramConfirmation'] = {
            templateName: 'holiday_program_confirmation.html',
            parentEmail: result[0].email,
            values: {
                parentName: result[0].firstName,
                location: `Fizz Kidz ${result[0].calendar}`,
                address: result[0].location,
                bookings: bookings,
            },
        }

        await mailClient.sendEmail('holidayProgramConfirmation', emailInfo)
        return true
    } catch(error) {
        console.error(error)
        throw new functions.https.HttpsError('internal', 'error booking into acuity', error)
    }
}

async function scheduleHolidayProgram(program: Acuity.Client.HolidayProgramBooking, paymentIntentId: string) {
    const options = {
        method: 'POST',
        body: {
            appointmentTypeID: program.appointmentTypeId,
            datetime: program.dateTime,
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
                    value: paymentIntentId
                },
                {
                    id: Acuity.Constants.FormFields.HOLIDAY_PROGRAM_AMOUNT_CHARGED,
                    value: program.amountCharged
                }
            ],
        },
    }

    return new Promise((resolve, reject) => {
        acuity.request(
            `/appointments?admin=true&noEmail=true`,
            options,
            (err: any, _acuityResult: any, appointment: Acuity.Appointment | Acuity.Error) => {
                if (hasError(err, appointment)) {
                    reject(err ?? appointment)
                    return
                }

                resolve(appointment)
            }
        )
    })
}
