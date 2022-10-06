import React from 'react'
import { ScienceEnrolment } from 'fizz-kidz'
import useInvoiceStatus from '../../../Hooks/api/UseInvoiceStatusV2'
import { Card, Typography } from 'antd'
import Loader from '../../shared/Loader'
import InvoiceStatistic from './InvoiceStatistic'
import { makeStyles } from '@material-ui/core'

type Props = {
    appointment: ScienceEnrolment
}

const InvoiceDetails: React.FC<Props> = ({ appointment }) => {
    const classes = useStyles()

    const [invoiceService] = useInvoiceStatus(appointment)

    return (
        <Card className={classes.card} title="🧾 Invoice Status">
            {(() => {
                switch (invoiceService.status) {
                    case 'loading':
                        return <Loader />
                    case 'loaded':
                        switch (invoiceService.result.status) {
                            case 'PAID':
                                return <InvoiceStatistic invoice={invoiceService.result} status="PAID" />
                            case 'UNPAID':
                                return <InvoiceStatistic invoice={invoiceService.result} status="UNPAID" />
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
                    default: // error
                        return (
                            <Typography.Text type="danger">There was an error retrieving your invoice.</Typography.Text>
                        )
                }
            })()}
        </Card>
    )
}

const useStyles = makeStyles({
    card: {
        height: '100%',
        boxShadow: 'rgba(100, 100, 111, 0.15) 0px 7px 29px 0px',
    },
})

export default InvoiceDetails
