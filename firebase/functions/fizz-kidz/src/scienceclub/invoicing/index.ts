export interface RetrieveInvoiceStatusParams {
    appointmentId: number
  }

export interface RetrieveInvoiceStatusResult {
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