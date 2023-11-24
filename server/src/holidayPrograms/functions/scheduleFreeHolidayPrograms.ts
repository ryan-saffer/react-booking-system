import { logError, onCall, throwFunctionsError } from '../../utilities'
import { scheduleHolidayProgram } from '../core/scheduleHolidayProgram'
import { sendConfirmationEmail } from '../core/sendConfirmationEmail'

export const scheduleFreeHolidayPrograms = onCall<'scheduleFreeHolidayPrograms'>(async (input) => {
    try {
        const result = await Promise.all(input.map((program) => scheduleHolidayProgram(program)))
        await sendConfirmationEmail(result)
    } catch (err) {
        logError(`error scheduling free holiday program for parent with email: ${input[0].parentEmail}`, err)
        throwFunctionsError('internal', 'there was an error booking into the holiday programs', err)
    }
})
