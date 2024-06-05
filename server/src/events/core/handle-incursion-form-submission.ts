import { IncursionEvent, IncursionForm, PaperFormResponse, getQuestionValue } from 'fizz-kidz'

import { DatabaseClient } from '../../firebase/DatabaseClient'
import { MailClient } from '../../sendgrid/MailClient'
import { DateTime } from 'luxon'

export async function handleIncursionFormSubmission(response: PaperFormResponse<IncursionForm>) {
    const eventId = getQuestionValue(response, 'id')

    // doesn't matter which slot we get, so let's just get the first and then update it.
    // the database client handles updating all siblings.
    const firstSlot = await DatabaseClient.getFirstEventSlot(eventId)

    if (firstSlot.$type === 'standard') {
        throw new Error(`Cannot update an incursion event with id '${eventId}/${firstSlot.id}' with type 'standard'`)
    }

    const organisation = getQuestionValue(response, 'organisation')
    const address = getQuestionValue(response, 'address')
    const numberOfChildren = getQuestionValue(response, 'numberOfChildren')
    const location = getQuestionValue(response, 'location')
    const parking = getQuestionValue(response, 'parking')
    const expectedLearning = getQuestionValue(response, 'expectedLearning')
    const teacherInformation = getQuestionValue(response, 'teacherInformation')
    const additionalInformation = getQuestionValue(response, 'additionalInformation')
    const hearAboutUs = getQuestionValue(response, 'hearAboutUs')

    const updatedSlot = {
        ...firstSlot,
        $incursionFormCompleted: true,
        organisation,
        address,
        numberOfChildren,
        location,
        parking,
        expectedLearning,
        teacherInformation,
        additionalInformation,
        hearAboutUs,
    } satisfies IncursionEvent

    await DatabaseClient.updateEventBooking(eventId, firstSlot.id, updatedSlot)

    const slots = await DatabaseClient.getEventSlots<'incursion'>(eventId)

    const mailClient = await MailClient.getInstance()
    await mailClient.sendEmail('incursionFormCompleted', firstSlot.contactEmail, {
        contactName: firstSlot.contactName,
        slots: slots.map(
            (slot) =>
                `${DateTime.fromJSDate(slot.startTime, { zone: 'Australia/Melbourne' }).toFormat(
                    'cccc, LLL dd, t'
                )} - ${DateTime.fromJSDate(slot.endTime, { zone: 'Australia/Melbourne' }).toFormat('t')}`
        ),
        numberOfChildren,
        location,
        parking,
        expectedLearning,
        teacherInformation,
        additionalInformation,
    })
}
