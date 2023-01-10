import { onCall } from '../../utilities'
import { ScheduleScienceAppointmentParams } from 'fizz-kidz'
import scheduleScienceProgram from '../core/scheduleScienceProgram'

export const scheduleScienceAppointment = onCall<'scheduleScienceAppointment'>(
    async (input: ScheduleScienceAppointmentParams) => {
        await scheduleScienceProgram(input)
    }
)
