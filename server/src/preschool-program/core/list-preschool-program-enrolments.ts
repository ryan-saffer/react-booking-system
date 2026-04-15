import type { ListPreschoolProgramEnrolmentsParams } from 'fizz-kidz'

import { DatabaseClient } from '@/firebase/DatabaseClient'

export async function listPreschoolProgramEnrolments(input: ListPreschoolProgramEnrolmentsParams) {
    return DatabaseClient.getPreschoolProgramEnrolments(input.appointmentTypeId, {
        includeInactive: input.includeInactive,
    })
}
