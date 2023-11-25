import { UpdateScienceEnrolmentParams } from 'fizz-kidz'

import { DatabaseClient } from '../../firebase/DatabaseClient'

export async function updateScienceEnrolment(input: UpdateScienceEnrolmentParams) {
    const { id, ...updatedEnrolment } = input

    await DatabaseClient.updateScienceEnrolment(id, updatedEnrolment)
    const enrolment = await DatabaseClient.getScienceEnrolment(id)

    return enrolment
}
