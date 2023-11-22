import { CallableRequest, onCall } from 'firebase-functions/v2/https'
import { logger } from 'firebase-functions/v2'
import { logError, throwError } from '../../utilities'

export const acuityClient = onCall(async ({ data }: CallableRequest<any>) => {
    try {
        console.log('still need to get logging')
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
