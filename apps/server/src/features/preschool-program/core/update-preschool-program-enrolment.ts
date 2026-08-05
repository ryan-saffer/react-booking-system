import type { UpdatePreschoolProgramEnrolmentParams } from '@fizz-kidz/core'

import { DatabaseClient } from '@/integrations/firebase/database.client'

export async function updatePreschoolProgramEnrolment(input: UpdatePreschoolProgramEnrolmentParams) {
    const { id, ...data } = input

    await DatabaseClient.updatePreschoolProgramEnrolment(id, {
        ...data,
        updatedAt: new Date(),
    })

    return DatabaseClient.getPreschoolProgramEnrolment(id)
}
