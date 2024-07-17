import { logger } from 'firebase-functions/v2'

import { handleIncursionFormSubmission } from '../../../events/core/handle-incursion-form-submission'
import { handlePartyFormSubmission } from '../../../party-bookings/core/handle-party-form-submission'
import { handlePartyFormSubmissionV2 } from '../../../party-bookings/core/handle-party-form-submission-v2'
import { handlePartyFormSubmissionV3 } from '../../../party-bookings/core/handle-party-form-submission-v3'
import { handleOnboardingFormSubmission } from '../../../staff/core/onboarding/handle-onboarding-form-submission'
import { onMessagePublished } from '../../../utilities'

export const paperformPubSub = onMessagePublished('paperformSubmission', async (input) => {
    const { form, data } = input

    switch (form) {
        case 'party':
            await handlePartyFormSubmission(data)
            break
        case 'party-v2':
            await handlePartyFormSubmissionV2(data)
            break
        case 'party-v3':
            await handlePartyFormSubmissionV3(data)
            break
        case 'incursion':
            await handleIncursionFormSubmission(data)
            break
        case 'onboarding':
            await handleOnboardingFormSubmission(data.formData, data.pdfUrl)
            break
        default: {
            const exhaustiveCheck: never = form
            logger.error(`unrecognised form type: '${exhaustiveCheck}'`)
        }
    }
})
