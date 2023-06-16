import * as functions from 'firebase-functions'
import { Acuity } from 'fizz-kidz'
import { AcuityClient } from '../core/AcuityClient'

type AcuityClientParams = {
    method: keyof Acuity.Client.AcuityFunctions
    input: any
}

export const acuityClient = functions.region('australia-southeast1').https.onCall(async (data: AcuityClientParams) => {
    let input
    try {
        switch (data.method) {
            case 'updateLabel':
                input = data.input as Acuity.Client.UpdateLabelParams
                return await AcuityClient.updateLabel(input)
            case 'updateAppointment':
                input = data.input as Acuity.Client.UpdateAppointmentParams
                return await AcuityClient.updateAppointment(input)
            case 'classAvailability':
                input = data.input as Acuity.Client.ClassAvailabilityParams
                return await AcuityClient.getClasses(input.appointmentTypeId, input.includeUnavailable, input.minDate)
            case 'checkCertificate':
                input = data.input as Acuity.Client.CheckCertificateParams
                return await AcuityClient.checkCertificate(input.certificate, input.appointmentTypeId, input.email)
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
    } catch (err: any) {
        if (err.error === 'invalid_certificate') {
            // this is okay.
            // we still want to throw as front end handles this, but not need for error log
            functions.logger.log('invalid discount code requested', { details: err })
        } else {
            functions.logger.error(`error calling acuity client with method: ${data.method}`, { details: err })
        }
        throw new functions.https.HttpsError('internal', `error calling acuity client with method: '${data.method}'`, {
            details: err,
        })
    }
})
