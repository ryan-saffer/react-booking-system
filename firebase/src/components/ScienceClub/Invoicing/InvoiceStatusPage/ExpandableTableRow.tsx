import React, { useState } from 'react'
import { makeStyles, Table, TableBody, TableRow, TableCell, IconButton } from '@material-ui/core'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp'

import { Acuity } from 'fizz-kidz'
import InvoiceStatusWithAction from './InvoiceStatusWithAction'

interface ExpandableTableRowPros {
    appointment: Acuity.Appointment
}

const ExpandableTableRow: React.FC<ExpandableTableRowPros> = ({ appointment }) => {
    
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
            <InvoiceStatusWithAction appointment={appointment} />
        </TableRow>
        {expanded &&
            <>
            <TableRow className={classes.appointmentDetailsRow}>
                <TableCell className={classes.appointmentDetailsCell} colSpan={4}>
                    <Table className={classes.appointmentDetailsTable}>
                        <TableBody>
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
                                <TableCell>{Acuity.Utilities.retrieveFormAndField(appointment, Acuity.Constants.Forms.CHILD_DETAILS, Acuity.Constants.FormFields.CHILD_NAME)}</TableCell>
                                <TableCell>{Acuity.Utilities.retrieveFormAndField(appointment, Acuity.Constants.Forms.CHILD_DETAILS, Acuity.Constants.FormFields.CHILD_AGE)}</TableCell>
                                <TableCell>{Acuity.Utilities.retrieveFormAndField(appointment, Acuity.Constants.Forms.CHILD_DETAILS, Acuity.Constants.FormFields.CHILD_GRADE)}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableCell>
            </TableRow>
            </>
        }
        </>
    )
}

const useStyles = makeStyles({
    summaryRow: {
        '& td': {
            textAlign: 'center',
            padding: '0px !important'
        }
    },
    parentNameCell: {
        textAlign: 'left !important' as 'left'
    },
    parentName: {
        justifySelf: 'flex-start',
        marginLeft: '80px'
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