import { IncursionForm, PaperFormResponse, PartyForm, PartyFormV3 } from '../paperform'

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
              form: 'party-v3'
              data: PaperFormResponse<PartyFormV3>
          }
}
