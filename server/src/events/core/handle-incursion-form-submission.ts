import { DateTime } from 'luxon'

import type { IncursionEvent, IncursionForm, PaperFormResponse } from 'fizz-kidz'
import {
    getQuestionValue,
    getStudioContactEmail,
    isFranchise,
    ModuleIncursionMap,
    ModuleNameMap,
    Utilities,
} from 'fizz-kidz'

import { DatabaseClient } from '@/firebase/DatabaseClient'
import { MixpanelClient } from '@/mixpanel/mixpanel-client'
import { MailClient } from '@/sendgrid/MailClient'

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
    const formattedSlots = slots.map(formatSlot)

    await mailClient.sendEmail('incursionFormCompletedToCustomer', firstSlot.contactEmail, {
        contactName: firstSlot.contactName,
        slots: formattedSlots,
        numberOfChildren,
        location,
        parking,
        expectedLearning,
        teacherInformation,
        additionalInformation,
    })

    await mailClient.sendEmail(
        'incursionFormCompletedToFizz',
        getStudioContactEmail(firstSlot.studio),
        {
            contactName: firstSlot.contactName,
            contactEmail: firstSlot.contactEmail,
            contactNumber: firstSlot.contactNumber,
            organisation,
            address,
            studio: Utilities.capitalise(firstSlot.studio),
            eventName: firstSlot.eventName,
            module: ModuleNameMap[firstSlot.module],
            incursion: ModuleIncursionMap[firstSlot.module],
            price: firstSlot.price,
            slots: formattedSlots,
            notes: firstSlot.notes,
            invoiceUrl: firstSlot.invoiceUrl,
            numberOfChildren,
            location,
            parking,
            expectedLearning,
            teacherInformation,
            additionalInformation,
            hearAboutUs,
        },
        {
            bccBookings: false,
            subject: `Incursion form completed - ${organisation}`,
            replyTo: firstSlot.contactEmail,
            cc: [...(!isFranchise(firstSlot.studio) ? ['kym@fizzkidz.com.au'] : [])],
        }
    )

    const mixpanel = await MixpanelClient.getInstance()
    await mixpanel.track('incursion-form-completed', {
        distinct_id: firstSlot.contactEmail,
        eventId,
        organisation,
        studio: firstSlot.studio,
        module: firstSlot.module,
        incursion: ModuleIncursionMap[firstSlot.module],
        numberOfChildren,
        numberOfSlots: slots.length,
        firstSlotStartTime: firstSlot.startTime,
        teacherInformation,
        hearAboutUs,
    })
}

function formatSlot(slot: IncursionEvent) {
    return `${DateTime.fromJSDate(slot.startTime, { zone: 'Australia/Melbourne' }).toFormat(
        'cccc, LLL dd, t'
    )} - ${DateTime.fromJSDate(slot.endTime, { zone: 'Australia/Melbourne' }).toFormat('t')}`
}
