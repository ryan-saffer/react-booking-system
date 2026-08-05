import type { ListPreschoolProgramEnrolmentsParams } from '@fizz-kidz/core'

import { DatabaseClient } from '@/integrations/firebase/database.client'

export async function listPreschoolProgramEnrolments(input: ListPreschoolProgramEnrolmentsParams) {
    return DatabaseClient.getPreschoolProgramEnrolments(input.appointmentTypeId, {
        includeInactive: input.includeInactive,
    })
}
