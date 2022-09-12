import { CheckCertificateParams } from './../../../../fizz-kidz/src/acuity/client'
import * as functions from 'firebase-functions'
import { Acuity, AppsScript } from 'fizz-kidz'
import { runAppsScript } from '../../../bookings'
import { hasError } from '../../shared'
import { AcuityClient } from '../../AcuityClient'
// import { throwError } from '../../../utilities'
const AcuitySdk = require('acuityscheduling')
const acuityCredentials = require('../../../../credentials/acuity_credentials.json')

const acuity = AcuitySdk.basic({
    userId: acuityCredentials.user_id,
    apiKey: acuityCredentials.api_key,
})

type AcuityClientParams = {
    method: keyof Acuity.Client.AcuityFunctions
    input: any
}

export const client = functions
    .region('australia-southeast1')
    .https.onCall(async (data: AcuityClientParams, _context: functions.https.CallableContext) => {
        let input
        const acuityClient = new AcuityClient()
        try {
            switch (data.method) {
                case 'updateEnrolment':
                    input = data.input as Acuity.Client.UpdateScienceEnrolmentParams
                    return updateEnrolment(input)
                case 'unenrollChildFromTerm':
                    input = data.input as Acuity.Client.UnenrollChildFromTermParams
                    return unenrollChildFromTerm(input)
                case 'updateLabel':
                    input = data.input as Acuity.Client.UpdateLabelParams
                    return updateLabel(input)
                case 'classAvailability':
                    input = data.input as Acuity.Client.ClassAvailabilityParams
                    return await acuityClient.getClasses(input.appointmentTypeId, input.minDate)
                case 'checkCertificate':
                    input = data.input as Acuity.Client.CheckCertificateParams
                    return checkCertificate(input)
                case 'getAppointmentTypes':
                    return await acuityClient.getAppointmentTypes()
            }
        } catch(err) {
            throw new functions.https.HttpsError('internal', 'error calling acuity client', err)
        }
    })

async function updateEnrolment(
    input: Acuity.Client.AcuityFunctions['updateEnrolment']['input']
): Promise<Acuity.Appointment[]> {
    try {
        return await updateAllScienceAppointmentsForChild(input)
    } catch (error) {
        throw new functions.https.HttpsError('internal', 'error updating all science club appointments', error)
    }
}

function updateAllScienceAppointmentsForChild(params: Acuity.Client.UpdateScienceEnrolmentParams) {
    const { email, appointmentTypeId, childName, fieldId, value } = params

    return new Promise<Acuity.Appointment[]>((resolve, reject) => {
        // first get every appointment of this child in this class
        // use child name, since a parent could have two children in a class
        // therefore appointmentTypeId and email is not enough
        acuity.request(
            `/appointments?email=${email}&appointmentTypeID=${appointmentTypeId}&field:${Acuity.Constants.FormFields.CHILD_NAME}=${childName}`,
            function (err: any, _resp: any, appointments: Acuity.Appointment[] | Acuity.Error) {
                if (hasError(err, appointments)) {
                    reject(err ?? appointments)
                    return
                }

                if (appointments.length <= 0) {
                    console.error('no appointments found matching params:', email, appointmentTypeId, childName)
                    reject('no appointments found matching params')
                    return
                }

                // then update each one with the invoice id
                const promises: Promise<Acuity.Appointment>[] = []
                console.log('updating all science club appointments for this client...')
                appointments.forEach((appointment) => {
                    promises.push(updateAppointmentFormField(appointment.id, fieldId, value))
                })
                Promise.all(promises)
                    .then((result) => {
                        console.log('successfully updated all appointments')
                        resolve(result)
                    })
                    .catch((error) => reject(error))
            }
        )
    })
}

function updateAppointmentFormField(appointmentId: number, fieldId: number, value: string) {
    console.log(`updating single appointment: ${appointmentId}`)
    const options = {
        method: 'PUT',
        body: {
            fields: [
                {
                    id: fieldId,
                    value: value,
                },
            ],
        },
    }

    return new Promise<Acuity.Appointment>((resolve, reject) => {
        acuity.request(
            `/appointments/${appointmentId}`,
            options,
            (err: any, _acuityRes: any, appointment: Acuity.Appointment | Acuity.Error) => {
                if (hasError(err, appointment)) {
                    reject(err ?? appointment)
                    return
                }

                resolve(appointment)
            }
        )
    })
}

function unenrollChildFromTerm(params: Acuity.Client.UnenrollChildFromTermParams) {
    const options = {
        method: 'PUT',
    }

    return new Promise<Acuity.Appointment>((resolve, reject) => {
        acuity.request(
            `/appointments/${params.appointmentId}/cancel?admin=true`,
            options,
            async (err: any, _acuityRes: any, appointment: Acuity.Appointment | Acuity.Error) => {
                if (hasError(err, appointment)) {
                    reject(err ?? appointment)
                    return
                }

                const appsScriptAppointment = {
                    parentName: appointment.firstName,
                    email: appointment.email,
                    className: appointment.type,
                    childName: Acuity.Utilities.retrieveFormAndField(
                        appointment,
                        Acuity.Constants.Forms.CHILD_DETAILS,
                        Acuity.Constants.FormFields.CHILD_NAME
                    ),
                }

                await runAppsScript(AppsScript.Functions.SEND_TERM_UNENROLMENT_CONFIRMATION_EMAIL, [
                    appsScriptAppointment,
                ])

                resolve(appointment)
            }
        )
    })
}

function updateLabel(data: Acuity.Client.UpdateLabelParams) {
    const options = {
        method: 'PUT',
        body: {
            labels: [{ id: data.label }],
        },
    }

    return new Promise((resolve, reject) => {
        acuity.request(
            `/appointments/${data.appointmentId}`,
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

async function checkCertificate(params: CheckCertificateParams) {
    return new Promise((resolve, reject) => {
        acuity.request(
            `/certificates/check?certificate=${params.certificate}&appointmentTypeID=${params.appointmentTypeId}&email=${params.email}`,
            (err: any, _acuityResult: any, result: Acuity.Certificate | Acuity.Error) => {
                if (hasError(err, result)) {
                    console.log('throw https error')
                    reject(new functions.https.HttpsError('aborted', 'error checking certicicate', err ?? result))
                }
                resolve(result)
            }
        )
    })
}
