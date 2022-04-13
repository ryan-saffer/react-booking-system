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
    UNSUPPORTED = "UNSUPPORTED"
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
    '189': '9',
    '168': '8',
    '147': '7',
    '126': '6',
    '105': '5',
    '84': '4',
    '63': '3',
    '42': '2',
    '21': '1'
}