import type { UpdatePreschoolProgramEnrolmentParams } from 'fizz-kidz'

import { DatabaseClient } from '@/firebase/DatabaseClient'

export async function updatePreschoolProgramEnrolment(input: UpdatePreschoolProgramEnrolmentParams) {
    const { id, ...data } = input

    await DatabaseClient.updatePreschoolProgramEnrolment(id, {
        ...data,
        updatedAt: new Date(),
    })

    return DatabaseClient.getPreschoolProgramEnrolment(id)
}
