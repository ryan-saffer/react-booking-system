import React, { useContext, useState } from 'react'
import { makeStyles, Button, CircularProgress, Chip, Table, TableBody, TableRow, TableCell, IconButton, TableHead } from '@material-ui/core'
import { green, orange, red, blue } from '@material-ui/core/colors'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp'

import useInvoiceStatus from '../../../Hooks/UseInvoiceStatus';
import { FirebaseContext } from '../../../Firebase'
import * as Utilities from '../../../../utilities'
import * as Acuity from '../../../../constants/acuity'

const ExpandableTableRow = ({ appointment }) => {
    
    const classes = useStyles()

    const [expanded, setExpanded] = useState(false)
    
    return(
        <>
        <TableRow className={classes.summaryRow}>
            <TableCell size="small">
                <IconButton onClick={() => setExpanded(!expanded)}>
                    {expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                </IconButton>
            </TableCell>
            <TableCell className={classes.parentNameCell} size="small">{appointment.firstName} {appointment.lastName}</TableCell>
            <InvoiceStatus appointment={appointment} />
        </TableRow>
        {expanded &&
            <>
            <TableRow className={classes.appointmentDetailsRow}>
                <TableCell className={classes.appointmentDetailsCell} colSpan={4}>
                    <Table className={classes.appointmentDetailsTable}>
                        <TableRow className={classes.appointmentDetailsHeaderRow}>
                            <TableCell variant="head" width="5%" className={classes.paddingCell} />
                            <TableCell variant="head" width="19%">Parent Phone</TableCell>
                            <TableCell variant="head" width="19%">Parent Email</TableCell>
                            <TableCell variant="head" width="19%">Child Name</TableCell>
                            <TableCell variant="head" width="19%">Child Age</TableCell>
                            <TableCell variant="head" width="19%">Child Grade</TableCell>
                        </TableRow>
                        <TableRow className={classes.appointmentDetailsContentRow}>
                            <TableCell className={classes.paddingCell}/>
                            <TableCell>{appointment.phone}</TableCell>
                            <TableCell>{appointment.email}</TableCell>
                            <TableCell>{Utilities.retrieveFormAndField(appointment, Acuity.FORMS.CHILD_DETAILS, Acuity.FORM_FIELDS.CHILD_NAME)}</TableCell>
                            <TableCell>{Utilities.retrieveFormAndField(appointment, Acuity.FORMS.CHILD_DETAILS, Acuity.FORM_FIELDS.CHILD_AGE)}</TableCell>
                            <TableCell>{Utilities.retrieveFormAndField(appointment, Acuity.FORMS.CHILD_DETAILS, Acuity.FORM_FIELDS.CHILD_GRADE)}</TableCell>
                        </TableRow>
                    </Table>
                </TableCell>
            </TableRow>
            </>
        }
        </>
    )
}

const InvoiceStatus = ({ appointment }) => {
    
    const classes = useStyles()

    const firebase = useContext(FirebaseContext)
    const [{ status, url }, setStatus] = useInvoiceStatus(appointment)

    const sendInvoice = (appointmentId, event) => {
        event.stopPropagation()
        console.log(appointmentId)
        setStatus({ status: "LOADING" })
        const childName = Utilities.retrieveFormAndField(appointment, Acuity.FORMS.CHILD_DETAILS, Acuity.FORM_FIELDS.CHILD_NAME)
        firebase.functions.httpsCallable('sendInvoice')({
            email: appointment.email,
            name: `${appointment.firstName} ${appointment.lastName}`,
            phone: appointment.phone,
            childName: childName,
            invoiceItem: `${childName} - ${appointment.type}`
        })
        .then(result => {
            console.log('setting status', result)
            setStatus(result.data)
        })
        .catch(error => {
            console.error(error)
            setStatus({ status: "ERROR" })
        })
    }

    const openUrl = (url, event) => {
        event.stopPropagation()
        window.open(url, "_blank")
    }

    switch (status) {
        case "LOADING":
            return (
                <TableCell size="small" colSpan={2}>
                    <CircularProgress size={24} />
                </TableCell>
            )
        case "PAID":
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
        case "UNPAID":
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
        case "NOT_SENT":
            return (
                <>
                <TableCell size="small">
                    <Chip className={classes.chipNotSent} label="INVOICE NOT SENT" />
                </TableCell>
                <TableCell size="small">
                    <Button className={classes.sendInvoiceButton} onClick={(event) => sendInvoice(appointment.id, event)}>Send Invoice</Button>
                </TableCell>
                </>
            )
        case "UNSUPPORTED":
            return <TableCell size='small' colSpan={2}>This class does not support invoices</TableCell>
        case "ERROR":
            return <TableCell className={classes.redText} size="small" colSpan={2}>Error while fetching invoice</TableCell>
    }
}

const chipWidth = 140
const useStyles = makeStyles({
    summaryRow: {
        '& td': {
            textAlign: 'center',
            padding: '0px !important'
        }
    },
    parentNameCell: {
        textAlign: 'left !important'
    },
    parentName: {
        justifySelf: 'flex-start',
        marginLeft: '80px'
    },
    chipPaid: {
        width: chipWidth,
        background: green[500]
    },
    chipUnpaid: {
        width: chipWidth,
        background: orange[500]
    },
    chipNotSent: {
        width: chipWidth,
        background: red[500]
    },
    viewInvoiceButton: {
        border: 'solid 1px black'
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
    appointmentDetailsRow: {
        background: 'whitesmoke',
    },
    appointmentDetailsCell: {
        paddingTop: 0,
        paddingLeft: 0,
        paddingRight: 0,
        '@media(max-width: 592px)': {
            paddingBottom: 0
        }
    },
    appointmentDetailsHeaderRow: {
        '& td': {
            paddingLeft: 0
        }
    },
    appointmentDetailsContentRow: {
        '& td': {
            paddingLeft: 0,
            paddingBottom: 0,
            borderBottomWidth: 0
        },
        '@media(max-width: 592px)': {
            '& td': {
                paddingBottom: 16
            }
        }
    },
    appointmentDetailsTable: {
        '@media(max-width: 592px)': {
            '& tr': {
                display: 'block',
                float: 'left',
                width: '50%'
            },
            '& td': {
                display: 'block',
                width: '100%',
                textAlign: 'center',
                borderBottomWidth: 1,
                minHeight: 57
            }
        }
    },
    paddingCell: {
        '@media(max-width: 592px)': {
            display: 'none !important'
        },
        '@media(max-width: 960px)': {
            paddingLeft: '32px !important'
        }
    }
})

export default ExpandableTableRow