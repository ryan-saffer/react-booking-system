import { IncursionForm, PaperFormResponse, PartyForm, PartyFormV2, PartyFormV3 } from '../paperform'

export interface PubSubFunctions {
    createEmployee: { employeeId: string }
    paperformSubmission:
        | {
              form: 'party'
              data: PaperFormResponse<PartyForm>
          }
        | {
              form: 'party-v2'
              data: PaperFormResponse<PartyFormV2>
          }
        | {
              form: 'party-v3'
              data: PaperFormResponse<PartyFormV3>
          }
        | {
              form: 'incursion'
              data: PaperFormResponse<IncursionForm>
          }
}
