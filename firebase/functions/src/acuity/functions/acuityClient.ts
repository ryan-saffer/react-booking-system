import { CheckCertificateParams } from 'fizz-kidz/src/acuity/client'
import * as functions from 'firebase-functions'
import { Acuity } from 'fizz-kidz'
import { hasError } from '../core/utilities'
import { AcuityClient } from '../core/AcuityClient'
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

export const acuityClient = functions
    .region('australia-southeast1')
    .https.onCall(async (data: AcuityClientParams, _context: functions.https.CallableContext) => {
        let input
        try {
            switch (data.method) {
                case 'updateLabel':
                    input = data.input as Acuity.Client.UpdateLabelParams
                    return updateLabel(input)
                case 'updateAppointment':
                    input = data.input as Acuity.Client.UpdateAppointmentParams
                    return await AcuityClient.updateAppointment(input)
                case 'classAvailability':
                    input = data.input as Acuity.Client.ClassAvailabilityParams
                    return await AcuityClient.getClasses(
                        input.appointmentTypeId,
                        input.includeUnavailable,
                        input.minDate
                    )
                case 'checkCertificate':
                    input = data.input as Acuity.Client.CheckCertificateParams
                    return checkCertificate(input)
                case 'getAppointmentTypes':
                    input = data.input as Acuity.Client.GetAppointmentTypesParams
                    return await AcuityClient.getAppointmentTypes(input)
                case 'getAppointments':
                    input = data.input as Acuity.Client.GetAppointmentsParams
                    return await AcuityClient.getAppointments(input.ids)
                case 'searchForAppointments':
                    input = data.input as Acuity.Client.FetchAppointmentsParams
                    return await AcuityClient.searchForAppointments(input)
            }
        } catch (err) {
            throw new functions.https.HttpsError('internal', 'error calling acuity client', err)
        }
    })

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
