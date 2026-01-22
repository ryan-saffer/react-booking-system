import { styled } from '@mui/material/styles'
import { useQuery } from '@tanstack/react-query'
import { Card, Typography } from 'antd'
import React from 'react'

import type { AfterSchoolEnrolment } from 'fizz-kidz'

import { useTRPC } from '@utils/trpc'

import InvoiceStatistic from './InvoiceStatistic'
import Loader from '../../../Shared/Loader'


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
    appointment: AfterSchoolEnrolment
}

const InvoiceDetails: React.FC<Props> = ({ appointment }) => {
    const trpc = useTRPC()
    const { data, isPending, isSuccess, isError } = useQuery(
        trpc.afterSchoolProgram.retrieveInvoiceStatuses.queryOptions(
            { appointmentIds: [appointment.id] },
            {
                enabled: appointment.invoiceId !== '',
                initialData: { [appointment.id]: { status: 'NOT_SENT' } },
            }
        )
    )

    return (
        <StyledCard className={classes.card} title="🧾 Invoice Status">
            {(() => {
                if (isPending) {
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
                                        {(parseFloat(appointment.price) * appointment.appointments.length).toFixed(2)}
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
