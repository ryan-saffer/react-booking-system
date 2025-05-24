import { Button, Statistic } from 'antd'
import type { ExistingInvoice } from 'fizz-kidz'
import React from 'react'

type Props = {
    invoice: ExistingInvoice
    status: 'PAID' | 'UNPAID'
}

const InvoiceStatistic: React.FC<Props> = ({ invoice, status }) => {
    return (
        <>
            <Statistic
                title={status === 'PAID' ? 'Paid' : 'Unpaid'}
                value={`$${(invoice.amount / 100).toFixed(2)}`}
                precision={2}
                valueStyle={{ color: status === 'PAID' ? '#3f8600' : '#cf1322' }}
            />
            <Button style={{ marginTop: 12 }} type="primary" href={invoice.paymentUrl} target="_blank">
                {status === 'PAID' ? 'View Invoice' : 'Pay Now'}
            </Button>
        </>
    )
}

export default InvoiceStatistic
