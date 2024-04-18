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
    '260': '10',
    '234': '9',
    '208': '8',
    '182': '7',
    '156': '6',
    '130': '5',
    '104': '4',
    '78': '3',
    '52': '2',
    '26': '1',
}
