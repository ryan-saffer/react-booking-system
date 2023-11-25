import { PFQuestion } from '../paperform'
import { GenerateTimesheetsParams, GenerateTimesheetsResponse, InitiateEmployeeProps } from '..'

export interface FirebaseFunctions {
    generateTimesheets: CloudFunction<GenerateTimesheetsParams, GenerateTimesheetsResponse>
    initiateOnboarding: CloudFunction<InitiateEmployeeProps, void>
}

export interface PubSubFunctions {
    handlePartyFormSubmission: PFQuestion<any>[]
    createEmployee: { employeeId: string }
}

export type CloudFunction<Input, Result> = {
    input: Input
    result: FunctionsResult<Result>
}

// https://stackoverflow.com/a/51507473
type FunctionsResult<T> = Omit<{ data: any }, 'data'> & { data: T }
