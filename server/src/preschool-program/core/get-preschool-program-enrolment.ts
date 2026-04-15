import type { GetPreschoolProgramEnrolmentParams } from 'fizz-kidz'

import { DatabaseClient } from '@/firebase/DatabaseClient'

export async function getPreschoolProgramEnrolment(input: GetPreschoolProgramEnrolmentParams) {
    return DatabaseClient.getPreschoolProgramEnrolment(input.id)
}
