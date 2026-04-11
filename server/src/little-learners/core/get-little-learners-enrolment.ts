import type { GetLittleLearnersEnrolmentParams } from 'fizz-kidz'

import { DatabaseClient } from '@/firebase/DatabaseClient'

export async function getLittleLearnersEnrolment(input: GetLittleLearnersEnrolmentParams) {
    return DatabaseClient.getLittleLearnersEnrolment(input.id)
}
