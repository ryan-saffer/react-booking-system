import { Tag } from 'antd'
import { InvoiceStatusMap, ScienceEnrolment } from 'fizz-kidz'
import React from 'react'

import Loader from '../../../shared/Loader'

type Props = {
    enrolment: ScienceEnrolment
    invoiceStatusMap: InvoiceStatusMap
}

const InvoiceStatusCell: React.FC<Props> = ({ enrolment, invoiceStatusMap }) => {
    const result = invoiceStatusMap[enrolment.id]
    if (result) {
        let colour
        let text
        switch (result.status) {
            case 'NOT_SENT':
                colour = 'gold'
                text = 'NOT SENT'
                break
            case 'UNPAID':
                colour = 'red'
                text = 'UNPAID'
                break
            case 'PAID':
                colour = 'green'
                text = 'PAID'
                break
            case 'VOID':
                colour = 'default'
                text = 'VOID'
                break
        }
        return <Tag color={colour}>{text}</Tag>
    }
    return <Loader size="sm" />
}

export default InvoiceStatusCell
