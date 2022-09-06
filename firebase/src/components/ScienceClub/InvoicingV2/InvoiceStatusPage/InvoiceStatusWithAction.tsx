import React, { useContext } from 'react'
import WithConfirmationDialog, { ConfirmationDialogProps } from '../../../Dialogs/ConfirmationDialog'
import { TableCell, LinearProgress, Chip, Button, makeStyles } from '@material-ui/core'
import { green, orange, red, blue } from '@material-ui/core/colors'

import { Acuity, InvoiceStatus, PriceWeekMap, ScienceAppointment } from 'fizz-kidz'
import Firebase from '../../../Firebase'
import { FirebaseContext } from '../../../Firebase'
import useInvoiceStatus from '../../../Hooks/UseInvoiceStatusV2'
import { callFirebaseFunction } from '../../../../utilities/firebase/functions'

interface InvoiceStatusProps extends ConfirmationDialogProps {
    appointment: ScienceAppointment
    setEnrolmentStatus: React.Dispatch<React.SetStateAction<Acuity.Client.ContinuingOption>>
    setEmailSent: React.Dispatch<React.SetStateAction<boolean>>
}

const InvoiceStatusWithAction: React.FC<InvoiceStatusProps> = (props) => {

    const {
        appointment,
        setEnrolmentStatus,
        setEmailSent,
        showConfirmationDialog
    } = props

    const classes = useStyles()

    const firebase = useContext(FirebaseContext) as Firebase
    const [service, setService] = useInvoiceStatus(appointment)

    const sendInvoice = (price: string) => {
        setService({ status: 'loading' })
        callFirebaseFunction('sendInvoiceV2', firebase)({
            id: appointment.id,
            price: price
        }).then(result => {
            setService({ status: 'loaded', result: result.data })
            setEmailSent(true)
            setEnrolmentStatus('yes')
        }).catch((error) => {
            setService({ status: 'error', error })
        })
    }

    const openUrl = (url: string | undefined, event: React.MouseEvent) => {
        event.stopPropagation()
        window.open(url, "_blank")
    }

    if (service.status === 'loading') {
        return (
            <>
                <TableCell size="small" colSpan={2}>
                    <LinearProgress className={classes.linearProgress} variant="indeterminate"/>
                </TableCell>
            </>
        )
    }

    if (service.status === 'loaded') {
        switch(service.result.status) {
            case InvoiceStatus.PAID:
                return (
                    <>
                        <TableCell size="small">
                            <Chip className={classes.chipPaid} label="PAID" /> 
                        </TableCell>
                        <TableCell size="small">
                            <Button className={classes.viewInvoiceButton} onClick={(event) => openUrl(service.result.url, event)}>View Invoice</Button>
                        </TableCell>
                    </>
                )
            case InvoiceStatus.UNPAID:
                return (
                    <>
                        <TableCell size="small">
                            <Chip className={classes.chipUnpaid} label="NOT PAID" />
                        </TableCell>
                        <TableCell size="small">
                            <Button className={classes.viewInvoiceButton} onClick={(event) => openUrl(service.result.url, event)}>View Invoice</Button>
                        </TableCell>
                    </>
                )
            case InvoiceStatus.NOT_SENT:
                return (
                    <>
                        <TableCell size="small">
                            <Chip className={classes.chipNotSent} label="INVOICE NOT SENT" />
                        </TableCell>
                        <TableCell size="small">
                            <Button
                                className={classes.sendInvoiceButton}
                                onClick={() => showConfirmationDialog({
                                    dialogTitle: "Send Invoice",
                                    dialogContent: `Select the amount you'd like to invoice ${appointment.parentFirstName}`,
                                    confirmationButtonText: "Send Invoice",
                                    listItems: { title: "Invoice Price", items: Object.entries(PriceWeekMap).map(([key, value]) => ({ key, value: `$${key} (${value} weeks)` }))},
                                    onConfirm: selectedPrice => sendInvoice(selectedPrice)
                                })}
                            >
                                Send Invoice
                            </Button>
                        </TableCell>
                    </>
                )
            case InvoiceStatus.UNSUPPORTED:
                return <TableCell size='small' colSpan={2}>This class does not support invoices</TableCell>
        }
    } else {
        return <TableCell className={classes.redText} size="small" colSpan={2}>Error while fetching invoice</TableCell>
    }
}

const chipWidth = 140
const useStyles = makeStyles({
    linearProgress: {
        width: '50%',
        left: '25%'
    },
    chipPaid: {
        width: chipWidth,
        background: green[500]
    },
    viewInvoiceButton: {
        border: 'solid 1px black'
    },
    chipUnpaid: {
        width: chipWidth,
        background: orange[500]
    },
    chipNotSent: {
        width: chipWidth,
        background: red[500]
    },
    sendInvoiceButton: {
        background: blue[400],
        '&:hover': {
            background: blue[600]
        }
    },
    redText: {
        color: red[500]
    },
})

export default WithConfirmationDialog(InvoiceStatusWithAction)