import type { PubSubFunctions } from 'fizz-kidz'

import { handleIncursionFormSubmission } from '@/events/core/handle-incursion-form-submission'
import { handleOnboardingFormSubmission } from '@/staff/core/onboarding/handle-onboarding-form-submission'
import { logError } from '@/utilities'

type PaperformMessage = Extract<PubSubFunctions['background'], { name: 'paperformSubmission' }>

export async function handlePaperformSubmission(input: PaperformMessage) {
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
}
