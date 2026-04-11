import type { UpdateLittleLearnersEnrolmentParams } from 'fizz-kidz'

import { DatabaseClient } from '@/firebase/DatabaseClient'

export async function updateLittleLearnersEnrolment(input: UpdateLittleLearnersEnrolmentParams) {
    const { id, ...data } = input

    await DatabaseClient.updateLittleLearnersEnrolment(id, {
        ...data,
        updatedAt: new Date(),
    })

    return DatabaseClient.getLittleLearnersEnrolment(id)
}
