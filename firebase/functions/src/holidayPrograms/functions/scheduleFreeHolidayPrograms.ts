import * as functions from 'firebase-functions'
import { onCall } from '../../utilities'
import { scheduleHolidayProgram } from '../core/scheduleHolidayProgram'
import { sendConfirmationEmail } from '../core/sendConfirmationEmail'

export const scheduleFreeHolidayPrograms = onCall<'scheduleFreeHolidayPrograms'>(async (input) => {
    try {
        const result = await Promise.all(input.map((program) => scheduleHolidayProgram(program)))
        await sendConfirmationEmail(result)
    } catch (err) {
        functions.logger.error(err)
        throw new functions.https.HttpsError('internal', 'acuity returned an error booking into holiday programs', err)
    }
})
