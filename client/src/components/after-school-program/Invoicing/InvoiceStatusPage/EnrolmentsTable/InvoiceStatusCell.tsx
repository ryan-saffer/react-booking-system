import { Tag } from 'antd'
import { AfterSchoolEnrolment, InvoiceStatusMap } from 'fizz-kidz'
import React from 'react'

import Loader from '../../../../Shared/Loader'

type Props = {
    enrolment: AfterSchoolEnrolment
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
