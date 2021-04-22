import { RetrieveInvoiceStatusParams, InvoiceStatusWithUrl, SendInvoiceParams } from '../scienceclub/invoicing'

export interface FirebaseFunctions {
    retrieveInvoiceStatus: Function<RetrieveInvoiceStatusParams, InvoiceStatusWithUrl>
    sendInvoice: Function<SendInvoiceParams, InvoiceStatusWithUrl>
}

export type Function<Input, Result> = {
    input: Input,
    result: FunctionsResult<Result>
}

// https://stackoverflow.com/a/51507473
type FunctionsResult<T> = Omit<{ data: any }, 'data'> & { data: T }
