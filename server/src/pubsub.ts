import { onMessagePublished, logError } from './utilities'
import { sendIncursionForms } from './events/functions/pubsub/send-incursion-forms'
import { sendGuestsEmail } from './party-bookings/functions/pubsub/send-guests-email'
import { sendPartyFormReminderEmails } from './party-bookings/functions/pubsub/send-party-form-reminder-emails'
import { sendPartyForms } from './party-bookings/functions/pubsub/send-party-forms'
import { sendPartyFeedbackEmails } from './party-bookings/functions/pubsub/send-party-feedback-emails'
import { remindAboutWwcc } from './staff/functions/pubsub/remind-about-wwcc'
import { handlePaperformSubmission } from './paperforms/functions/pubsub/paperform.pubsub'
import type { PubSubFunctions } from 'fizz-kidz'

export const pubsub = onMessagePublished('background', async (input: PubSubFunctions['background']) => {
    switch (input.name) {
        case 'sendIncursionForms':
            await sendIncursionForms()
            break
        case 'sendGuestsEmail':
            await sendGuestsEmail()
            break
        case 'sendPartyFormReminderEmails':
            await sendPartyFormReminderEmails()
            break
        case 'sendPartyForms':
            await sendPartyForms()
            break
        case 'sendPartyFeedbackEmails':
            await sendPartyFeedbackEmails()
            break
        case 'remindAboutWwcc':
            await remindAboutWwcc()
            break
        case 'paperformSubmission':
            await handlePaperformSubmission(input)
            break
        default:
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            logError(`unrecognised pubsub task: '${(input as any).name}'`)
    }
})
