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
    price: string
    [key: string]: string
}

// prices depend on how many weeks they are attending the program for
// use this map to include the number of weeks in the invoice
export const PriceWeekMap: { [key: string]: string } = {
    '216': '9',
    '192': '8',
    '168': '7',
    '144': '6',
    '120': '5',
    '96': '4',
    '72': '3',
    '48': '2',
    '24': '1',
}
