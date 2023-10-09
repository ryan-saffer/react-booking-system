import { CallableRequest, onCall } from 'firebase-functions/v2/https'
import { logger } from 'firebase-functions/v2'
import { logError, throwError } from '../../utilities'
import type { Acuity } from 'fizz-kidz'
import { AcuityClient } from '../core/AcuityClient'

type AcuityClientParams = {
    method: keyof Acuity.Client.AcuityFunctions
    input: any
}

export const acuityClient = onCall(async ({ data }: CallableRequest<AcuityClientParams>) => {
    let input
    try {
        const acuity = await AcuityClient.getInstance()
        switch (data.method) {
            case 'updateLabel':
                input = data.input as Acuity.Client.UpdateLabelParams
                return await acuity.updateLabel(input)
            case 'updateAppointment':
                input = data.input as Acuity.Client.UpdateAppointmentParams
                return await acuity.updateAppointment(input)
            case 'classAvailability':
                input = data.input as Acuity.Client.ClassAvailabilityParams
                return await acuity.getClasses(input.appointmentTypeId, input.includeUnavailable, input.minDate)
            case 'checkCertificate':
                input = data.input as Acuity.Client.CheckCertificateParams
                return await acuity.checkCertificate(input.certificate, input.appointmentTypeId, input.email)
            case 'getAppointmentTypes':
                input = data.input as Acuity.Client.GetAppointmentTypesParams
                return await acuity.getAppointmentTypes(input)
            case 'getAppointments':
                input = data.input as Acuity.Client.GetAppointmentsParams
                return await acuity.getAppointments(input.ids)
            case 'searchForAppointments':
                input = data.input as Acuity.Client.FetchAppointmentsParams
                return await acuity.searchForAppointments(input)
        }
    } catch (err: any) {
        if (err.error === 'invalid_certificate' || err.error === 'certificate_uses') {
            // this is okay.
            // we still want to throw as front end handles this, but no need for error log
            logger.log('invalid discount code requested', { details: err })
        } else {
            logError(`error calling acuity client with method: ${data.method}`, err)
        }
        throwError('internal', `error calling acuity client with method: '${data.method}'`, err)
    }
})
