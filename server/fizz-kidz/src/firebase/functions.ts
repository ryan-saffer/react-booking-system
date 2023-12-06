import { PaperFormResponse, PartyForm } from '../paperform'

export interface PubSubFunctions {
    handlePartyFormSubmission: PaperFormResponse<PartyForm>
    createEmployee: { employeeId: string }
}
