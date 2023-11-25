import { PFQuestion } from '../paperform'

export interface PubSubFunctions {
    handlePartyFormSubmission: PFQuestion<any>[]
    createEmployee: { employeeId: string }
}
