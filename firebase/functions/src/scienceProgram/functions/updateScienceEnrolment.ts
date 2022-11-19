import * as functions from 'firebase-functions'
import { UpdateScienceEnrolmentParams } from 'fizz-kidz'
import { FirestoreClient } from '../../firebase/FirestoreClient'
import { onCall } from '../../utilities'

export const updateScienceEnrolment = onCall<'updateScienceEnrolment'>(
    async (input: UpdateScienceEnrolmentParams, _context: functions.https.CallableContext) => {
        const { id, ...updatedEnrolment } = input

        await FirestoreClient.updateScienceEnrolment(id, updatedEnrolment)
        const enrolment = (await FirestoreClient.getScienceEnrolment(id)).data()!

        return enrolment
    }
)
