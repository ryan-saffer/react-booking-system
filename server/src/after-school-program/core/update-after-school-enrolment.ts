import { UpdateAfterSchoolEnrolmentParams } from 'fizz-kidz'

import { DatabaseClient } from '../../firebase/DatabaseClient'

export async function updateAfterSchoolEnrolment(input: UpdateAfterSchoolEnrolmentParams) {
    const { id, ...updatedEnrolment } = input

    await DatabaseClient.updateAfterSchoolEnrolment(id, updatedEnrolment)
    const enrolment = await DatabaseClient.getAfterSchoolEnrolment(id)

    return enrolment
}
