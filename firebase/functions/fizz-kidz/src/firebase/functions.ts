import { RetrieveInvoiceStatusParams, SendInvoiceParams, InvoiceStatus } from '../scienceclub/invoicing'
import {
    CreatePaymentIntentParams,
    CreatePaymentIntentResponse,
    ScheduleScienceAppointmentParams,
    ScienceEnrolment,
    SendTermContinuationEmailParams,
    UnenrollScienceAppointmentParams,
    UpdatePaymentIntentParams,
    UpdateScienceEnrolmentParams,
} from '..'

export interface FirebaseFunctions {
    retrieveInvoiceStatus: Function<RetrieveInvoiceStatusParams, InvoiceStatus>
    sendInvoice: Function<SendInvoiceParams, InvoiceStatus>
    voidAndResendInvoice: Function<SendInvoiceParams, InvoiceStatus>
    sendTermContinuationEmail: Function<SendTermContinuationEmailParams, void>
    createPaymentIntent: Function<CreatePaymentIntentParams, CreatePaymentIntentResponse>
    updatePaymentIntent: Function<UpdatePaymentIntentParams, void>
    scheduleScienceAppointment: Function<ScheduleScienceAppointmentParams, void>
    unenrollScienceAppointment: Function<UnenrollScienceAppointmentParams, void>
    updateScienceEnrolment: Function<UpdateScienceEnrolmentParams, ScienceEnrolment>
    sendPortalLinks: Function<void, void>
}

export type Function<Input, Result> = {
    input: Input
    result: FunctionsResult<Result>
}

// https://stackoverflow.com/a/51507473
type FunctionsResult<T> = Omit<{ data: any }, 'data'> & { data: T }
