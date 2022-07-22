import { RetrieveInvoiceStatusParams, InvoiceStatusWithUrl, SendInvoiceParams } from '../scienceclub/invoicing'
import { Appointment } from '../acuity';
import { CreatePaymentIntentParams, CreatePaymentIntentResponse, UpdatePaymentIntentParams } from '..';

export interface FirebaseFunctions {
    retrieveInvoiceStatus: Function<RetrieveInvoiceStatusParams, InvoiceStatusWithUrl>
    sendInvoice: Function<SendInvoiceParams, InvoiceStatusWithUrl>
    voidAndResendInvoice: Function<SendInvoiceParams, InvoiceStatusWithUrl>
    sendTermContinuationEmail: Function<Appointment, null>
    createPaymentIntent: Function<CreatePaymentIntentParams, CreatePaymentIntentResponse>
    updatePaymentIntent: Function<UpdatePaymentIntentParams, void>
}

export type Function<Input, Result> = {
    input: Input,
    result: FunctionsResult<Result>
}

// https://stackoverflow.com/a/51507473
type FunctionsResult<T> = Omit<{ data: any }, 'data'> & { data: T }
