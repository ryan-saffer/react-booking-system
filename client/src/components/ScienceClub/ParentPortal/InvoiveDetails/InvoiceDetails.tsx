import { Card, Typography } from 'antd'

import InvoiceStatistic from './InvoiceStatistic'
import Loader from '../../shared/Loader'
import React from 'react'
import { ScienceEnrolment } from 'fizz-kidz'
import { styled } from '@mui/material/styles'
import { trpc } from '@utils/trpc'

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
    const { data, isLoading, isSuccess, isError } = trpc.stripe.retrieveInvoiceStatuses.useQuery(
        {
            appointmentIds: [appointment.id],
        },
        {
            enabled: appointment.invoiceId !== '',
            initialData: { [appointment.id]: { status: 'NOT_SENT' } },
        }
    )

    return (
        <StyledCard className={classes.card} title="🧾 Invoice Status">
            {(() => {
                if (isLoading) {
                    return <Loader />
                }

                if (isError) {
                    return <Typography.Text type="danger">There was an error retrieving your invoice.</Typography.Text>
                }

                if (isSuccess) {
                    const invoiceStatus = data[appointment.id]
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
            })()}
        </StyledCard>
    )
}

export default InvoiceDetails
