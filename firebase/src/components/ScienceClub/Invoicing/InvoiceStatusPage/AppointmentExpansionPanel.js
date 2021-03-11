import React from 'react'
import { Accordion, AccordionSummary, makeStyles, Typography, Button } from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import useInvoiceStatus from '../../../Hooks/UseInvoiceStatus';

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
                    <Typography>{appointment.firstName} {appointment.lastName}</Typography>
                    <Typography> Invoice Status: </Typography>
                    <InvoiceStatus appointment={appointment} />
                </div>
            </AccordionSummary>
        </Accordion>
    )
}

const InvoiceStatus = ({ appointment }) => {
    
    const classes = useStyles()

    const { status, url } = useInvoiceStatus(appointment)

    const sendInvoice = (appointmentId, event) => {
        event.stopPropagation()
        console.log(appointmentId)
    }

    switch (status) {
        case "LOADING":
            return <Typography>Loading invoice...</Typography>
        case "PAID":
            return (
                <Typography>
                    <a
                        href={url}
                        target="_blank"
                        onClick={event => event.stopPropagation()}
                    >
                        Invoice paid
                    </a>
                </Typography>
            )
        case "UNPAID":
            return (
                <Typography>
                    <a
                        href={url}
                        target="_blank"
                        onClick={event => event.stopPropagation()}
                    >
                        Invoice not yet paid
                    </a>
                </Typography>
            )
        case "NOT_SENT":
            return (
                <div>
                <Typography>Invoice not yet sent!</Typography>
                <Button onClick={(event) => sendInvoice(appointment.id, event)}>Send Invoice</Button>
                </div>
            )
        case "UNSUPPORTED":
            return <Typography>This class does not support invoices</Typography>
        case "ERROR":
            return <Typography>... Error while fetching invoice</Typography>
    }
}

const useStyles = makeStyles({
    panelSummary: {
        display: 'grid',
        width: '100%',
        gridTemplateColumns: '1fr 1fr 1fr'
    }
})

export default AppointmentExpansionPanel