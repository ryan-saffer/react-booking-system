import { DatabaseClient } from '../../firebase/DatabaseClient'
import { onCall } from '../../utilities'

export const updateScienceEnrolment = onCall<'updateScienceEnrolment'>(async (input) => {
    const { id, ...updatedEnrolment } = input

    await DatabaseClient.updateScienceEnrolment(id, updatedEnrolment)
    const enrolment = await DatabaseClient.getScienceEnrolment(id)

    return enrolment
})
