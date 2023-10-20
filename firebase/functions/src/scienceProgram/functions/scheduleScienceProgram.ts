import { onCall } from '../../utilities'
import { ScheduleScienceAppointmentParams } from 'fizz-kidz'
import scheduleScienceProgram from '../core/scheduleScienceProgram'
import { logger } from 'firebase-functions/v2'

export const scheduleScienceAppointment = onCall<'scheduleScienceAppointment'>(
    async (input: ScheduleScienceAppointmentParams) => {
        logger.log(input)
        await scheduleScienceProgram(input)
    }
)
