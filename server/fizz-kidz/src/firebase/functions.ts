import type { IncursionForm, OnboardingForm, PaperFormResponse } from '../paperform'

export interface PubSubFunctions {
    createEmployee: { employeeId: string }
    paperformSubmission:
        | {
              form: 'incursion'
              data: PaperFormResponse<IncursionForm>
          }
        | {
              form: 'onboarding'
              data: { formData: PaperFormResponse<OnboardingForm>; pdfUrl: string }
          }
}
