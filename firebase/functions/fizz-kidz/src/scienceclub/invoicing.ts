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