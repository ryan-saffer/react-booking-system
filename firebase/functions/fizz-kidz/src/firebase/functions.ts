import {
    RetrieveInvoiceStatusParams,
    RetrieveInvoiceStatusParamsV2,
    SendInvoiceParams,
    SendInvoiceParamsV2,
    InvoiceStatus
} from '../scienceclub/invoicing'
import { Appointment } from '../acuity'
import {
    CreatePaymentIntentParams,
    CreatePaymentIntentResponse,
    ScheduleScienceAppointmentParams,
    ScienceAppointment,
    SendTermContinuationEmailParams,
    UnenrollScienceAppointmentParams,
    UpdatePaymentIntentParams,
    UpdateScienceEnrolmentParams,
} from '..'

export interface FirebaseFunctions {
    retrieveInvoiceStatus: Function<RetrieveInvoiceStatusParams, InvoiceStatus>
    retrieveInvoiceStatusV2: Function<RetrieveInvoiceStatusParamsV2, InvoiceStatus>
    sendInvoice: Function<SendInvoiceParams, InvoiceStatus>
    sendInvoiceV2: Function<SendInvoiceParamsV2, InvoiceStatus>
    voidAndResendInvoice: Function<SendInvoiceParams, InvoiceStatus>
    voidAndResendInvoiceV2: Function<SendInvoiceParamsV2, InvoiceStatus>
    sendTermContinuationEmail: Function<Appointment, null>
    sendTermContinuationEmailV2: Function<SendTermContinuationEmailParams, void>
    createPaymentIntent: Function<CreatePaymentIntentParams, CreatePaymentIntentResponse>
    updatePaymentIntent: Function<UpdatePaymentIntentParams, void>
    scheduleScienceAppointment: Function<ScheduleScienceAppointmentParams, void>
    unenrollScienceAppointment: Function<UnenrollScienceAppointmentParams, void>
    updateScienceEnrolment: Function<UpdateScienceEnrolmentParams, ScienceAppointment>
    sendPortalLinks: Function<void, void>
}

export type Function<Input, Result> = {
    input: Input
    result: FunctionsResult<Result>
}

// https://stackoverflow.com/a/51507473
type FunctionsResult<T> = Omit<{ data: any }, 'data'> & { data: T }
