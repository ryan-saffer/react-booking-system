import { SendInvoiceParams, RetrieveInvoiceStatusesParams, InvoiceStatusMap } from '../scienceclub/invoicing'
import {
    CreatePaymentIntentParams,
    CreatePaymentIntentResponse,
    ScheduleScienceAppointmentParams,
    ScienceEnrolment,
    SendTermContinuationEmailsParams,
    UnenrollScienceAppointmentsParams,
    UpdatePaymentIntentParams,
    UpdateScienceEnrolmentParams,
} from '..'

export interface FirebaseFunctions {
    retrieveInvoiceStatuses: Function<RetrieveInvoiceStatusesParams, InvoiceStatusMap>
    sendInvoices: Function<SendInvoiceParams[], InvoiceStatusMap>
    sendTermContinuationEmails: Function<SendTermContinuationEmailsParams, string[]>
    createPaymentIntent: Function<CreatePaymentIntentParams, CreatePaymentIntentResponse>
    updatePaymentIntent: Function<UpdatePaymentIntentParams, void>
    scheduleScienceAppointment: Function<ScheduleScienceAppointmentParams, void>
    unenrollScienceAppointments: Function<UnenrollScienceAppointmentsParams, void>
    updateScienceEnrolment: Function<UpdateScienceEnrolmentParams, ScienceEnrolment>
    sendPortalLinks: Function<void, void>
}

export type Function<Input, Result> = {
    input: Input
    result: FunctionsResult<Result>
}

// https://stackoverflow.com/a/51507473
type FunctionsResult<T> = Omit<{ data: any }, 'data'> & { data: T }
