import React, { useContext } from 'react'
import WithConfirmationDialog, { ConfirmationDialogProps } from '../../../Dialogs/ConfirmationDialog'
import { TableCell, LinearProgress, Chip, Button, makeStyles } from '@material-ui/core'
import { green, orange, red, blue } from '@material-ui/core/colors'

import { Acuity, InvoiceStatus } from 'fizz-kidz'
import Firebase from '../../../Firebase'
import { FirebaseContext } from '../../../Firebase'
import useInvoiceStatus from '../../../Hooks/UseInvoiceStatus'

// prices depend on how many weeks they are attending the program for
// use this map to include the number of weeks in the invoice
const PriceWeekMap: { [key: string]: string } = {
    '195': '9',
    '173': '8',
    '151': '7',
    '129': '6'
}

interface InvoiceStatusProps extends ConfirmationDialogProps {
    appointment: Acuity.Appointment
}

const InvoiceStatusWithAction: React.FC<InvoiceStatusProps> = ({ appointment, showConfirmationDialog }) => {

    const classes = useStyles()

    const firebase = useContext(FirebaseContext) as Firebase
    const [{ status, url }, setStatus] = useInvoiceStatus(appointment)

    const sendInvoice = (price: string) => {
        setStatus({ status: InvoiceStatus.LOADING })
        const childName = Acuity.Utilities.retrieveFormAndField(appointment, Acuity.Constants.Forms.CHILD_DETAILS, Acuity.Constants.FormFields.CHILD_NAME)
        firebase.functions.httpsCallable('sendInvoice')({
            email: appointment.email,
            name: `${appointment.firstName} ${appointment.lastName}`,
            phone: appointment.phone,
            childName: childName,
            invoiceItem: `${childName} - ${appointment.type} - ${PriceWeekMap[price]} Weeks`,
            appointmentTypeId: appointment.appointmentTypeID,
            price: price
        })
        .then(result => {
            setStatus(result.data)
        })
        .catch(error => {
            console.error(error)
            setStatus({ status: InvoiceStatus.ERROR })
        })
    }

    const openUrl = (url: string | undefined, event: React.MouseEvent) => {
        event.stopPropagation()
        window.open(url, "_blank")
    }

    switch (status) {
        case InvoiceStatus.LOADING:
            return (
                <>
                <TableCell size="small" colSpan={2}>
                    <LinearProgress className={classes.linearProgress} variant="indeterminate"/>
                </TableCell>
                </>
            )
        case InvoiceStatus.PAID:
            return (
                <>
                <TableCell size="small">
                    <Chip className={classes.chipPaid} label="PAID" /> 
                </TableCell>
                <TableCell size="small">
                    <Button className={classes.viewInvoiceButton} onClick={(event) => openUrl(url, event)}>View Invoice</Button>
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
                    <Button className={classes.viewInvoiceButton} onClick={(event) => openUrl(url, event)}>View Invoice</Button>
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
                            dialogContent: `Select the amount you'd like to invoice ${appointment.firstName}`,
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
        case InvoiceStatus.ERROR:
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