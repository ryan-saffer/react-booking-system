import type { IncursionForm, PaperFormResponse, PartyForm } from '../paperform'
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
}
