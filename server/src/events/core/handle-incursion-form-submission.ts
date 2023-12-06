import { IncursionEvent, IncursionForm, PaperFormResponse, getQuestionValue } from 'fizz-kidz'

import { DatabaseClient } from '../../firebase/DatabaseClient'

export async function handleIncursionFormSubmission(response: PaperFormResponse<IncursionForm>) {
    const eventId = getQuestionValue(response, 'id')

    // doesn't matter which slot we get, so let's just get the first and then update it.
    // the database client handles updating all siblings.
    const firstSlot = await DatabaseClient.getFirstEventSlot(eventId)

    if (firstSlot.type === 'standard') {
        throw new Error(`Cannot update an incursion event with id '${eventId}/${firstSlot.id}' with type 'standard'`)
    }

    const updatedSlot = {
        ...firstSlot,
        organisation: getQuestionValue(response, 'organisation'),
        address: getQuestionValue(response, 'address'),
        numberOfChildren: getQuestionValue(response, 'numberOfChildren'),
        location: getQuestionValue(response, 'location'),
        parking: getQuestionValue(response, 'parking'),
        expectedLearning: getQuestionValue(response, 'expectedLearning'),
        teacherInformation: getQuestionValue(response, 'teacherInformation'),
        additionalInformation: getQuestionValue(response, 'additionalInformation'),
        hearAboutUs: getQuestionValue(response, 'hearAboutUs'),
    } satisfies IncursionEvent

    await DatabaseClient.updateEventBooking(eventId, firstSlot.id, updatedSlot)
}
