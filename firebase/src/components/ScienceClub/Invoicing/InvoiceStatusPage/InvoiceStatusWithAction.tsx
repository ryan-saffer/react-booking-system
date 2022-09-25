import React, { useContext } from 'react'
import WithConfirmationDialog, { ConfirmationDialogProps } from '../../../Dialogs/ConfirmationDialog'
import { TableCell, LinearProgress, Chip, Button, makeStyles } from '@material-ui/core'
import { green, orange, red, blue } from '@material-ui/core/colors'

import { Acuity, PriceWeekMap } from 'fizz-kidz'
import Firebase from '../../../Firebase'
import { FirebaseContext } from '../../../Firebase'
import useInvoiceStatus from '../../../Hooks/UseInvoiceStatus'
import { callFirebaseFunction } from '../../../../utilities/firebase/functions'

interface InvoiceStatusProps extends ConfirmationDialogProps {
    appointment: Acuity.Appointment
    setEnrolmentStatus: React.Dispatch<React.SetStateAction<Acuity.Client.ContinuingOption>>
    setEmailSent: React.Dispatch<React.SetStateAction<boolean>>
}

const InvoiceStatusWithAction: React.FC<InvoiceStatusProps> = (props) => {
    const { appointment, setEnrolmentStatus, setEmailSent, showConfirmationDialog } = props

    const classes = useStyles()

    const firebase = useContext(FirebaseContext) as Firebase
    const [service, setService] = useInvoiceStatus(appointment)

    const sendInvoice = (price: string) => {
        setService({ status: 'loading' })
        const childName = Acuity.Utilities.retrieveFormAndField(
            appointment,
            Acuity.Constants.Forms.CHILD_DETAILS,
            Acuity.Constants.FormFields.CHILD_NAME
        )
        callFirebaseFunction(
            'sendInvoice',
            firebase
        )({
            email: appointment.email,
            name: `${appointment.firstName} ${appointment.lastName}`,
            phone: appointment.phone,
            childName: childName,
            invoiceItem: `${childName} - ${appointment.type} - ${PriceWeekMap[price]} Weeks`,
            appointmentTypeId: appointment.appointmentTypeID,
            price: price,
        })
            .then((result) => {
                setService({ status: 'loaded', result: result.data })
                setEmailSent(true)
                setEnrolmentStatus('yes')
            })
            .catch((error) => {
                setService({ status: 'error', error })
            })
    }

    const openUrl = (url: string | undefined, event: React.MouseEvent) => {
        event.stopPropagation()
        window.open(url, '_blank')
    }

    if (service.status === 'loading') {
        return (
            <>
                <TableCell size="small" colSpan={2}>
                    <LinearProgress className={classes.linearProgress} variant="indeterminate" />
                </TableCell>
            </>
        )
    }

    if (service.status === 'loaded') {
        const invoiceStatus = service.result
        switch (invoiceStatus.status) {
            case 'PAID':
                return (
                    <>
                        <TableCell size="small">
                            <Chip className={classes.chipPaid} label="PAID" />
                        </TableCell>
                        <TableCell size="small">
                            <Button
                                className={classes.viewInvoiceButton}
                                onClick={(event) => openUrl(invoiceStatus.dashboardUrl, event)}
                            >
                                View Invoice
                            </Button>
                        </TableCell>
                    </>
                )
            case 'UNPAID':
                return (
                    <>
                        <TableCell size="small">
                            <Chip className={classes.chipUnpaid} label="NOT PAID" />
                        </TableCell>
                        <TableCell size="small">
                            <Button
                                className={classes.viewInvoiceButton}
                                onClick={(event) => openUrl(invoiceStatus.dashboardUrl, event)}
                            >
                                View Invoice
                            </Button>
                        </TableCell>
                    </>
                )
            case 'NOT_SENT':
                return (
                    <>
                        <TableCell size="small">
                            <Chip className={classes.chipNotSent} label="INVOICE NOT SENT" />
                        </TableCell>
                        <TableCell size="small">
                            <Button
                                className={classes.sendInvoiceButton}
                                onClick={() =>
                                    showConfirmationDialog({
                                        dialogTitle: 'Send Invoice',
                                        dialogContent: `Select the amount you'd like to invoice ${appointment.firstName}`,
                                        confirmationButtonText: 'Send Invoice',
                                        listItems: {
                                            title: 'Invoice Price',
                                            items: Object.entries(PriceWeekMap).map(([key, value]) => ({
                                                key,
                                                value: `$${key} (${value} weeks)`,
                                            })),
                                        },
                                        onConfirm: (selectedPrice) => sendInvoice(selectedPrice),
                                    })
                                }
                            >
                                Send Invoice
                            </Button>
                        </TableCell>
                    </>
                )
            case 'UNSUPPORTED':
                return (
                    <TableCell size="small" colSpan={2}>
                        This class does not support invoices
                    </TableCell>
                )
        }
    } else {
        return (
            <TableCell className={classes.redText} size="small" colSpan={2}>
                Error while fetching invoice
            </TableCell>
        )
    }
}

const chipWidth = 140
const useStyles = makeStyles({
    linearProgress: {
        width: '50%',
        left: '25%',
    },
    chipPaid: {
        width: chipWidth,
        background: green[500],
    },
    viewInvoiceButton: {
        border: 'solid 1px black',
    },
    chipUnpaid: {
        width: chipWidth,
        background: orange[500],
    },
    chipNotSent: {
        width: chipWidth,
        background: red[500],
    },
    sendInvoiceButton: {
        background: blue[400],
        '&:hover': {
            background: blue[600],
        },
    },
    redText: {
        color: red[500],
    },
})

export default WithConfirmationDialog(InvoiceStatusWithAction)
