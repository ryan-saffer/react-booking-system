import type { IncursionForm, OnboardingForm, PaperFormResponse } from '../paperform'

export interface PubSubFunctions {
    background:
        | { name: 'sendIncursionForms' }
        | { name: 'sendGuestsEmail' }
        | { name: 'sendPartyFormReminderEmails' }
        | { name: 'sendPartyForms' }
        | { name: 'sendPartyFeedbackEmails' }
        | { name: 'remindAboutWwcc' }
        | { name: 'updateSlingWages' }
        | { name: 'paperformSubmission'; form: 'incursion'; data: PaperFormResponse<IncursionForm> }
        | {
              name: 'paperformSubmission'
              form: 'onboarding'
              data: { formData: PaperFormResponse<OnboardingForm>; pdfUrl: string }
          }
}
