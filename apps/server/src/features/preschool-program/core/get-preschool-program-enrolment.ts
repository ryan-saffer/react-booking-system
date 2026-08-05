import type { GetPreschoolProgramEnrolmentParams } from '@fizz-kidz/core'

import { DatabaseClient } from '@/integrations/firebase/database.client'

export async function getPreschoolProgramEnrolment(input: GetPreschoolProgramEnrolmentParams) {
    return DatabaseClient.getPreschoolProgramEnrolment(input.id)
}
