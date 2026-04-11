import type { InvoiceStatus, LittleLearnersEnrolment } from 'fizz-kidz'

import { env } from '@/init'
import { SquareClient } from '@/square/core/square-client'
import { throwTrpcError } from '@/utilities'

export async function retrieveLittleLearnersInvoiceStatus(enrolment: LittleLearnersEnrolment): Promise<InvoiceStatus> {
    if (!enrolment.invoiceId) {
        return { status: 'NOT_SENT' }
    }

    const square = await SquareClient.getInstance()
    const { invoice } = await square.invoices
        .get({
            invoiceId: enrolment.invoiceId,
        })
        .catch((err) =>
            throwTrpcError('INTERNAL_SERVER_ERROR', 'error getting Little Learners invoice from square', err, {
                enrolment,
            })
        )

    if (!invoice || !invoice.status || !invoice.id || !(typeof invoice.version === 'number')) {
        throwTrpcError(
            'INTERNAL_SERVER_ERROR',
            'unable to find existing Little Learners invoice in square despite enrolment having an invoice id',
            null,
            { enrolment }
        )
    }

    const dashboardUrl = env === 'prod' ? 'https://app.squareup.com' : 'https://app.squareupsandbox.com'
    const url = `${dashboardUrl}/invoices/${invoice.id}`

    if (invoice.status === 'PAID' || invoice.status === 'PARTIALLY_REFUNDED') {
        return {
            status: 'PAID',
            amount: parseInt(invoice.paymentRequests![0].computedAmountMoney!.amount!.toString()),
            dashboardUrl: url,
            paymentUrl: invoice.publicUrl || '',
        }
    }

    if (invoice.status === 'CANCELED') {
        return {
            status: 'VOID',
            amount: parseInt(invoice.paymentRequests![0].computedAmountMoney!.amount!.toString()),
            dashboardUrl: url,
            paymentUrl: invoice.publicUrl || '',
        }
    }

    return {
        status: 'UNPAID',
        amount: parseInt(invoice.paymentRequests![0].computedAmountMoney!.amount!.toString()),
        dashboardUrl: url,
        paymentUrl: invoice.publicUrl || '',
    }
}
