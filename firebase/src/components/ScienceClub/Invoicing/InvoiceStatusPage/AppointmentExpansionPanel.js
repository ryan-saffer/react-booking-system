import React, { useContext } from 'react'
import { Accordion, AccordionSummary, makeStyles, Typography, Button, CircularProgress, Chip,
AccordionDetails, Table, TableBody, TableRow, TableCell } from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { green, orange, red, blue } from '@material-ui/core/colors'

import useInvoiceStatus from '../../../Hooks/UseInvoiceStatus';
import { FirebaseContext } from '../../../Firebase'
import * as Utilities from '../../../../utilities'
import * as Acuity from '../../../../constants/acuity'

const AppointmentExpansionPanel = props => {
    
    const classes = useStyles()

    const { appointment, expanded } = props
    
    return(
        <Accordion
            key={appointment.id}
            expanded={expanded === appointment.id}
            onChange={props.onAppointmentSelectionChange(appointment.id)}
        >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <div className={classes.panelSummary}>
                    <Typography className={classes.parentName}>{appointment.firstName} {appointment.lastName}</Typography>
                    <InvoiceStatus appointment={appointment} />
                </div>
            </AccordionSummary>
            <AccordionDetails>
                <Table size="small">
                    <TableBody>
                        <TableRow>
                            <TableCell variant="head">Parent Phone:</TableCell>
                            <TableCell>{appointment.phone}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell variant="head">Parent Email:</TableCell>
                            <TableCell>{appointment.email}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell variant="head">Child Name:</TableCell>
                            <TableCell>{Utilities.retrieveFormAndField(appointment, Acuity.FORMS.CHILD_DETAILS, Acuity.FORM_FIELDS.CHILD_NAME)}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell variant="head">Child Age:</TableCell>
                            <TableCell>{Utilities.retrieveFormAndField(appointment, Acuity.FORMS.CHILD_DETAILS, Acuity.FORM_FIELDS.CHILD_AGE)}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell variant="head">Child Grade:</TableCell>
                            <TableCell>{Utilities.retrieveFormAndField(appointment, Acuity.FORMS.CHILD_DETAILS, Acuity.FORM_FIELDS.CHILD_GRADE)}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </AccordionDetails>
        </Accordion>
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
            return <CircularProgress size={24} />
        case "PAID":
            return (
                <>
                <Chip className={classes.chipPaid} label="PAID" /> 
                <Button className={classes.viewInvoiceButton} onClick={(event) => openUrl(url, event)}>View Invoice</Button>
                </>
            )
        case "UNPAID":
            return (
                <>
                <Chip className={classes.chipUnpaid} label="NOT PAID" />
                <Button className={classes.viewInvoiceButton} onClick={(event) => openUrl(url, event)}>View Invoice</Button>
                </>
            )
        case "NOT_SENT":
            return (
                <>
                <Chip className={classes.chipNotSent} label="INVOICE NOT SENT" />
                <Button className={classes.sendInvoiceButton} onClick={(event) => sendInvoice(appointment.id, event)}>Send Invoice</Button>
                </>
            )
        case "UNSUPPORTED":
            return <Typography>This class does not support invoices</Typography>
        case "ERROR":
            return <Typography className={classes.redText}>Error while fetching invoice</Typography>
    }
}

const chipWidth = 140
const useStyles = makeStyles({
    panelSummary: {
        display: 'grid',
        width: '100%',
        gridTemplateColumns: '1fr 1fr 1fr',
        justifyItems: 'center',
        alignItems: 'center'
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
    }
})

export default AppointmentExpansionPanel