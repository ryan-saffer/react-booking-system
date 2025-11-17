import { onMessagePublished, logError } from './utilities'
import { sendIncursionForms } from './events/core/send-incursion-forms'
import { sendGuestsEmail } from './party-bookings/core/send-guests-email'
import { sendPartyFormReminderEmails } from './party-bookings/core/send-party-form-reminder-emails'
import { sendPartyForms } from './party-bookings/core/send-party-forms'
import { sendPartyFeedbackEmails } from './party-bookings/core/send-party-feedback-emails'
import { remindAboutWwcc } from './staff/core/remind-about-wwcc'
import { handlePaperformSubmission } from './paperforms/functions/pubsub/paperform.pubsub'
import { assertNever, type PubSubFunctions } from 'fizz-kidz'
import { updateSlingWages } from './sling/update-sling-wages'

export const pubsub = onMessagePublished('background', async (input: PubSubFunctions['background']) => {
    const { name } = input
    switch (name) {
        case 'sendIncursionForms':
            // daily at 8:30am
            await sendIncursionForms()
            break
        case 'sendGuestsEmail':
            // daily at 12pm
            await sendGuestsEmail()
            break
        case 'sendPartyFormReminderEmails':
            // 8:30am every Monday
            await sendPartyFormReminderEmails()
            break
        case 'sendPartyForms':
            // 8:30am every Tuesday
            await sendPartyForms()
            break
        case 'sendPartyFeedbackEmails':
            // daily at 8:30am
            await sendPartyFeedbackEmails()
            break
        case 'remindAboutWwcc':
            // 1st and 15th of every month at 8:30am
            await remindAboutWwcc()
            break
        case 'updateSlingWages':
            // 6:00am every Friday
            await updateSlingWages()
            break
        case 'paperformSubmission':
            // triggered by paperform webhook
            await handlePaperformSubmission(input)
            break
        default:
            assertNever(name)
            logError(`unrecognised pubsub task: '${name}'`)
    }
})
