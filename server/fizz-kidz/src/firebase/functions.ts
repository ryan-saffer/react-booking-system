import type { IncursionForm, OnboardingForm, PaperFormResponse, PartyForm } from '../paperform'
import { type PartyFormV2 } from '../paperform'

export interface PubSubFunctions {
    createEmployee: { employeeId: string }
    paperformSubmission:
        | {
              form: 'party'
              data: PaperFormResponse<PartyForm>
              charge: any
          }
        | {
              form: 'party-v2'
              data: PaperFormResponse<PartyFormV2>
              charge: any
          }
        | {
              form: 'incursion'
              data: PaperFormResponse<IncursionForm>
          }
        | {
              form: 'onboarding'
              data: { formData: PaperFormResponse<OnboardingForm>; pdfUrl: string }
          }
}
