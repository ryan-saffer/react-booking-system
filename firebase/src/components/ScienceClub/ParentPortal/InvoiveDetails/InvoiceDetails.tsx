import React from 'react'
import { ScienceAppointment } from 'fizz-kidz'
import useInvoiceStatus from '../../../Hooks/UseInvoiceStatusV2'
import { Button, Card, Statistic } from 'antd'
import Loader from '../Loader'
import InvoiceStatistic from './InvoiceStatistic'
import { makeStyles } from '@material-ui/core'

type Props = {
    appointment: ScienceAppointment
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
                                    // TODO: Confirm if price is term price, or weekly price.
                                    // NOTE: Changing to weekly will require change in acuity appointmen type.
                                    <>
                                        <p>Invoice not yet sent.</p>
                                        <p>The price for the full term is ${appointment.price}.</p>
                                    </>
                                )
                        }
                    default: // error
                        // TODO
                        return <h1>ERROR</h1>
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
