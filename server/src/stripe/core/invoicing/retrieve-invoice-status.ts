import type { AfterSchoolEnrolment, InvoiceStatus } from 'fizz-kidz'

import * as StripeConfig from '../../../config/stripe'
import { env } from '../../../init'
import { retrieveLatestInvoice } from './retrieve-latest-invoice'

const stripeConfig = env === 'prod' ? StripeConfig.PROD_CONFIG : StripeConfig.DEV_CONFIG

export async function retrieveInvoiceStatus(enrolment: AfterSchoolEnrolment): Promise<InvoiceStatus> {
    if (!enrolment.invoiceId) {
        return { status: 'NOT_SENT' }
    } else {
        // invoice already created... check its status
        const invoice = await retrieveLatestInvoice(enrolment.invoiceId)
        const url = `${stripeConfig.STRIPE_DASHBOARD}/invoices/${invoice.id}`
        if (invoice.paid) {
            return {
                status: 'PAID',
                amount: invoice.amount_due,
                dashboardUrl: url,
                paymentUrl: invoice.hosted_invoice_url || '',
            }
        } else if (invoice.status === 'void') {
            return {
                status: 'VOID',
                amount: invoice.amount_due,
                dashboardUrl: url,
                paymentUrl: invoice.hosted_invoice_url || '',
            }
        } else {
            return {
                status: 'UNPAID',
                amount: invoice.amount_due,
                dashboardUrl: url,
                paymentUrl: invoice.hosted_invoice_url || '',
            }
        }
    }
}
