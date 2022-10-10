import React from 'react'
import { ScienceEnrolment } from 'fizz-kidz'
import { Tag } from 'antd'
import Loader from '../../../shared/Loader'
import { InvoiceStatusMap } from './EnrolmentsTable'

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
        }
        return <Tag color={colour}>{text}</Tag>
    }
    return <Loader size="sm" />
}

export default InvoiceStatusCell
