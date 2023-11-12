import { Card, Typography } from 'antd'
import { ScienceEnrolment } from 'fizz-kidz'
import React from 'react'

import useInvoiceStatus from '@components/Hooks/api/UseInvoiceStatus'
import { styled } from '@mui/material/styles'

import Loader from '../../shared/Loader'
import InvoiceStatistic from './InvoiceStatistic'
const PREFIX = 'InvoiceDetails'

const classes = {
    card: `${PREFIX}-card`,
}

const StyledCard = styled(Card)({
    [`&.${classes.card}`]: {
        height: '100%',
        boxShadow: 'rgba(100, 100, 111, 0.15) 0px 7px 29px 0px',
    },
})

type Props = {
    appointment: ScienceEnrolment
}

const InvoiceDetails: React.FC<Props> = ({ appointment }) => {
    const [invoiceService] = useInvoiceStatus(appointment)

    return (
        <StyledCard className={classes.card} title="🧾 Invoice Status">
            {(() => {
                switch (invoiceService.status) {
                    case 'loading':
                        return <Loader />
                    case 'loaded': {
                        const invoiceStatus = invoiceService.result[appointment.id]
                        switch (invoiceStatus.status) {
                            case 'PAID':
                                return <InvoiceStatistic invoice={invoiceStatus} status="PAID" />
                            case 'UNPAID':
                                return <InvoiceStatistic invoice={invoiceStatus} status="UNPAID" />
                            default:
                                return (
                                    <>
                                        <p>Invoice not yet sent.</p>
                                        <p>
                                            The price for {appointment.appointments.length} weeks is $
                                            {parseInt(appointment.price) * appointment.appointments.length}
                                        </p>
                                    </>
                                )
                        }
                    }
                    default: // error
                        return (
                            <Typography.Text type="danger">There was an error retrieving your invoice.</Typography.Text>
                        )
                }
            })()}
        </StyledCard>
    )
}

export default InvoiceDetails
