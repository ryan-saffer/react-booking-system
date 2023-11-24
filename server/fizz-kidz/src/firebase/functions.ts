import { PFQuestion } from '../paperform'
import {
    GenerateTimesheetsParams,
    GenerateTimesheetsResponse,
    InitiateEmployeeProps,
    ScheduleScienceAppointmentParams,
    ScienceEnrolment,
    SendTermContinuationEmailsParams,
    UnenrollScienceAppointmentsParams,
    UpdateScienceEnrolmentParams,
} from '..'

export interface FirebaseFunctions {
    sendTermContinuationEmails: CloudFunction<SendTermContinuationEmailsParams, string[]>
    scheduleScienceAppointment: CloudFunction<ScheduleScienceAppointmentParams, void>
    unenrollScienceAppointments: CloudFunction<UnenrollScienceAppointmentsParams, void>
    updateScienceEnrolment: CloudFunction<UpdateScienceEnrolmentParams, ScienceEnrolment>
    sendPortalLinks: CloudFunction<void, void>
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
