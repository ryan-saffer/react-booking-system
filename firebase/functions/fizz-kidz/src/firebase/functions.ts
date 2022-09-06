import {
    RetrieveInvoiceStatusParams,
    RetrieveInvoiceStatusParamsV2,
    InvoiceStatusWithUrl,
    SendInvoiceParams,
    SendInvoiceParamsV2,
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
    retrieveInvoiceStatus: Function<RetrieveInvoiceStatusParams, InvoiceStatusWithUrl>
    retrieveInvoiceStatusV2: Function<RetrieveInvoiceStatusParamsV2, InvoiceStatusWithUrl>
    sendInvoice: Function<SendInvoiceParams, InvoiceStatusWithUrl>
    sendInvoiceV2: Function<SendInvoiceParamsV2, InvoiceStatusWithUrl>
    voidAndResendInvoice: Function<SendInvoiceParams, InvoiceStatusWithUrl>
    voidAndResendInvoiceV2: Function<SendInvoiceParamsV2, InvoiceStatusWithUrl>
    sendTermContinuationEmail: Function<Appointment, null>
    sendTermContinuationEmailV2: Function<SendTermContinuationEmailParams, void>
    createPaymentIntent: Function<CreatePaymentIntentParams, CreatePaymentIntentResponse>
    updatePaymentIntent: Function<UpdatePaymentIntentParams, void>
    scheduleScienceAppointment: Function<ScheduleScienceAppointmentParams, void>
    unenrollScienceAppointment: Function<UnenrollScienceAppointmentParams, void>
    updateScienceEnrolment: Function<UpdateScienceEnrolmentParams, ScienceAppointment>
}

export type Function<Input, Result> = {
    input: Input
    result: FunctionsResult<Result>
}

// https://stackoverflow.com/a/51507473
type FunctionsResult<T> = Omit<{ data: any }, 'data'> & { data: T }
