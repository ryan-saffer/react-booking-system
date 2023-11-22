import { CallableRequest, onCall } from 'firebase-functions/v2/https'
import { logger } from 'firebase-functions/v2'
import { logError, throwError } from '../../utilities'
import type { AcuityTypes } from 'fizz-kidz'
import { AcuityClient } from '../core/acuity-client'

type AcuityClientParams = {
    method: keyof AcuityTypes.Client.AcuityFunctions
    input: any
}

export const acuityClient = onCall(async ({ data }: CallableRequest<AcuityClientParams>) => {
    let input
    try {
        const acuity = await AcuityClient.getInstance()
        switch (data.method) {
            case 'classAvailability':
                input = data.input as AcuityTypes.Client.ClassAvailabilityParams
                return await acuity.getClasses(input.appointmentTypeId, input.includeUnavailable, input.minDate)
            case 'checkCertificate':
                input = data.input as AcuityTypes.Client.CheckCertificateParams
                return await acuity.checkCertificate(input.certificate, input.appointmentTypeId, input.email)
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
