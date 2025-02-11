import { IncursionForm, PaperFormResponse, PartyFormV2 } from '../paperform'

export interface PubSubFunctions {
    createEmployee: { employeeId: string }
    paperformSubmission:
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
