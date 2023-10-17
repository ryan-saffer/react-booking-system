import React from 'react'
import { InvoiceStatusMap, ScienceEnrolment } from 'fizz-kidz'
import { Button, Descriptions } from 'antd'
import { makeStyles } from '@material-ui/core'
import { getBaseUrl } from '../../../../../utilities/firebase/env'
import * as ROUTES from '../../../../../constants/routes'

type Props = {
    enrolment: ScienceEnrolment
    invoiceStatusMap: InvoiceStatusMap
}

const EnrolmentDetails: React.FC<Props> = ({ enrolment, invoiceStatusMap }) => {
    const classes = useStyles()
    const status = invoiceStatusMap[enrolment.id]

    return (
        <Descriptions className={classes.description} bordered size="small" column={1}>
            <Descriptions.Item label="Parent Phone">{enrolment.parent.phone}</Descriptions.Item>
            <Descriptions.Item label="Parent Email">{enrolment.parent.email}</Descriptions.Item>
            <Descriptions.Item label="Child Name">
                {enrolment.child.firstName} {enrolment.child.lastName}
            </Descriptions.Item>
            <Descriptions.Item label="Child Grade">{enrolment.child.grade}</Descriptions.Item>
            <Descriptions.Item label="Child Age">{enrolment.child.age}</Descriptions.Item>
            <Descriptions.Item label="Parent Portal">
                <Button
                    href={`${getBaseUrl()}${ROUTES.SCIENCE_PROGRAM_PARENT_PORTAL.split(':')[0]}${enrolment.id}`}
                    target="_blank"
                    onClick={(e) => e.stopPropagation()}
                >
                    Parent Portal
                </Button>
            </Descriptions.Item>
            {status && (status.status === 'PAID' || status.status === 'UNPAID' || status.status === 'VOID') && (
                <Descriptions.Item label="Invoice">
                    <Button href={status.dashboardUrl} target="_blank" onClick={(e) => e.stopPropagation()}>
                        View Invoice
                    </Button>
                </Descriptions.Item>
            )}
        </Descriptions>
    )
}

const useStyles = makeStyles({
    description: {
        '& th': {
            backgroundColor: '#f7f7f7f7 !important',
            fontWeight: 500,
        },
    },
})

export default EnrolmentDetails
