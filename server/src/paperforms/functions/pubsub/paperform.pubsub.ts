import { logger } from 'firebase-functions/v2'

import { handleIncursionFormSubmission } from '../../../events/core/handle-incursion-form-submission'
import { handlePartyFormSubmission } from '../../../party-bookings/core/handle-party-form-submission'
import { handlePartyFormSubmissionV2 } from '../../../party-bookings/core/handle-party-form-submission-v2'
import { onMessagePublished } from '../../../utilities'

export const paperformPubSub = onMessagePublished('paperformSubmission', async (input) => {
    const { form, data } = input

    switch (form) {
        case 'party':
            await handlePartyFormSubmission(data, input.charge)
            break
        case 'party-v2':
            await handlePartyFormSubmissionV2(data, input.charge)
            break
        case 'incursion':
            await handleIncursionFormSubmission(data)
            break
        default: {
            const exhaustiveCheck: never = form
            logger.error(`unrecognised form type: '${exhaustiveCheck}'`)
        }
    }
})
