import type { PubSubFunctions } from '@fizz-kidz/core'

import { handleIncursionFormSubmission } from '@/features/events/core/handle-incursion-form-submission'
import { handleOnboardingFormSubmission } from '@/features/staff/core/onboarding/handle-onboarding-form-submission'
import { logError } from '@/integrations/observability/log-error'

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
