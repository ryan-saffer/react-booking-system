export interface RetrieveInvoiceStatusParams {
    appointmentId: number
}

export interface InvoiceStatusWithUrl {
    status: InvoiceStatus,
    url?: string
}

export enum InvoiceStatus {
    NOT_SENT = "NOT_SENT",
    UNPAID = "UNPAID",
    PAID = "PAID",
    UNSUPPORTED = "UNSUPPORTED",
    LOADING = "LOADING",
    ERROR = "ERROR"
}

export interface SendInvoiceParams {
    email: string,
    name: string,
    phone: string,
    childName: string
    invoiceItem: string,
    appointmentTypeId: number,
    price: string,
    [key: string]: string | number
}

// prices depend on how many weeks they are attending the program for
// use this map to include the number of weeks in the invoice
export const PriceWeekMap: { [key: string]: string } = {
    '195': '9',
    '173': '8',
    '151': '7',
    '129': '6',
    '107': '5',
    '85': '4',
    '63': '3',
    '40': '2',
    '20': '1'
}