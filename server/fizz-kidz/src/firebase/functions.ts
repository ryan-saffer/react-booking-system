import { IncursionForm, PaperFormResponse, PartyForm } from '../paperform'

export interface PubSubFunctions {
    createEmployee: { employeeId: string }
    paperformSubmission:
        | {
              form: 'party'
              data: PaperFormResponse<PartyForm>
              charge: any
          }
        | {
              form: 'incursion'
              data: PaperFormResponse<IncursionForm>
          }
}
