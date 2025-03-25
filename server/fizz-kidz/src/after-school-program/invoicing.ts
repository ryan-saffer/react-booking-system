export type RetrieveInvoiceStatusParams = {
    appointmentId: string
}

export type RetrieveInvoiceStatusesParams = {
    appointmentIds: string[]
}

// INVOICING
export type InvoiceStatus = ExistingInvoice | OtherInvoice

export type ExistingInvoice = {
    status: 'PAID' | 'UNPAID' | 'VOID'
    amount: number
    dashboardUrl: string
    paymentUrl: string
}

type OtherInvoice = {
    status: 'NOT_SENT' | 'UNSUPPORTED'
}

export type InvoiceStatusMap = { [key: string]: InvoiceStatus }

export interface SendInvoiceParams {
    id: string
    numberOfWeeks: number
}
