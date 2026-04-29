import { assertNever, type PubSubFunctions } from 'fizz-kidz'

import { sendIncursionForms } from './events/core/send-incursion-forms'
import { handlePaperformSubmission } from './paperforms/functions/pubsub/paperform.pubsub'
import { cleanUpStaleInvitations } from './party-bookings/core/rsvp/clean-up-stale-invitations'
import { sendCakeForms } from './party-bookings/core/send-cake-form'
import { sendGuestsEmail } from './party-bookings/core/send-guests-email'
import { sendPartyFeedbackEmails } from './party-bookings/core/send-party-feedback-emails'
import { sendPartyFormReminderEmails } from './party-bookings/core/send-party-form-reminder-emails'
import { sendPartyForms } from './party-bookings/core/send-party-forms'
import { updateSlingWages } from './sling/update-sling-wages'
import { remindAboutTurning18NextMonth } from './staff/core/remind-about-turning-18-next-month'
import { remindAboutWwcc } from './staff/core/remind-about-wwcc'
import { sendMinimumShiftLengthReport } from './staff/core/send-minimum-shift-length-report'
import { onMessagePublished, logError } from './utilities'

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
        case 'sendCakeForms':
            // 8:30am every Tuesday
            await sendCakeForms()
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
        case 'remindAboutTurning18NextMonth':
            // 15th of every month at 8:30am
            await remindAboutTurning18NextMonth()
            break
        case 'updateSlingWages':
            // 6:00am every Friday
            await updateSlingWages()
            break
        case 'sendMinimumShiftLengthReport':
            // every Monday at 6:00am; the report checks whether it's the fortnightly pay-cycle Monday
            await sendMinimumShiftLengthReport()
            break
        case 'paperformSubmission':
            // triggered by paperform webhook
            await handlePaperformSubmission(input)
            break
        case 'cleanUpStaleInvitations':
            // 1st of each month at 3:00am
            await cleanUpStaleInvitations()
            break
        default:
            assertNever(name)
            logError(`unrecognised pubsub task: '${name}'`)
    }
})
