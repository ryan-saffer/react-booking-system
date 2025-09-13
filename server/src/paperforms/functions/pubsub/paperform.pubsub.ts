import { handleIncursionFormSubmission } from '@/events/core/handle-incursion-form-submission'
import { handleOnboardingFormSubmission } from '@/staff/core/onboarding/handle-onboarding-form-submission'
import { logError, onMessagePublished } from '@/utilities'

export const paperformPubSub = onMessagePublished('paperformSubmission', async (input) => {
    const { form, data } = input

    switch (form) {
        case 'incursion':
            await handleIncursionFormSubmission(data)
            break
        case 'onboarding':
            await handleOnboardingFormSubmission(data.formData, data.pdfUrl)
            break
        default: {
            const exhaustiveCheck: never = form
            logError(`unrecognised form type: '${exhaustiveCheck}'`)
        }
    }
})
