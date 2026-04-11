import type { ListLittleLearnersEnrolmentsParams } from 'fizz-kidz'

import { DatabaseClient } from '@/firebase/DatabaseClient'

export async function listLittleLearnersEnrolments(input: ListLittleLearnersEnrolmentsParams) {
    return DatabaseClient.getLittleLearnersEnrolments(input.appointmentTypeId, {
        includeInactive: input.includeInactive,
    })
}
