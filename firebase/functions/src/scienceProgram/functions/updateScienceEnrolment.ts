import { FirestoreClient } from '../../firebase/FirestoreClient'
import { onCall } from '../../utilities'

export const updateScienceEnrolment = onCall<'updateScienceEnrolment'>(async (input) => {
    const { id, ...updatedEnrolment } = input

    await FirestoreClient.updateScienceEnrolment(id, updatedEnrolment)
    const enrolment = await FirestoreClient.getScienceEnrolment(id)

    return enrolment
})
