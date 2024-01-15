import { IncursionForm, PaperFormResponse, PartyForm, PartyFormV2 } from '../paperform'

export interface PubSubFunctions {
    createEmployee: { employeeId: string }
    paperformSubmission:
        | {
              form: 'party'
              data: PaperFormResponse<PartyForm>
          }
        | {
              form: 'incursion'
              data: PaperFormResponse<IncursionForm>
          }
        | {
              form: 'party-v2'
              data: PaperFormResponse<PartyFormV2>
          }
}
