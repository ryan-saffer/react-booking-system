import React, { useState } from 'react'
import { makeStyles, Table, TableBody, TableRow, TableCell, IconButton, CircularProgress } from '@material-ui/core'
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp'
import ClearIcon from '@material-ui/icons/Clear'
import CheckIcon from '@material-ui/icons/Check'

import { Acuity, ScienceAppointment } from 'fizz-kidz'
import InvoiceStatusWithAction from './InvoiceStatusWithAction'
import EnrolmentStatusCell from './EnrolmentStatusCell'
import MenuWithActions from './MenuWithActions'
import WithErrorDialog, { ErrorDialogProps } from '../../../Dialogs/ErrorDialog'
import useForceRerenderComponent from '../../../Hooks/UseForceRerenderComponent'

interface ExpandableTableRowPros extends ErrorDialogProps {
    appointment: ScienceAppointment
}

const ExpandableTableRow: React.FC<ExpandableTableRowPros> = ({ appointment, displayError }) => {
    const classes = useStyles()

    const forceRerenderExpandableRow = useForceRerenderComponent()

    const [expanded, setExpanded] = useState(false)
    const [loading, setLoading] = useState(false)
    const [isDeleted, setIsDeleted] = useState(false)

    const [enrolmentStatus, setEnrolmentStatus] = useState(appointment.continuingWithTerm)
    const [emailSent, setEmailSent] = useState(appointment.emails.continuingEmailSent)

    if (isDeleted) {
        return null
    } else if (loading) {
        return (
            <TableRow>
                <TableCell className={classes.loadingCell} size="small" colSpan={7}>
                    <CircularProgress className={classes.loadingSpinner} />
                </TableCell>
            </TableRow>
        )
    } else {
        return (
            <>
                <TableRow className={classes.summaryRow}>
                    <TableCell size="small">
                        <IconButton onClick={() => setExpanded(!expanded)}>
                            {expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                    </TableCell>
                    <TableCell size="small">
                        <MenuWithActions
                            appointment={appointment}
                            setLoading={setLoading}
                            setEmailSent={setEmailSent}
                            setIsDeleted={setIsDeleted}
                            displayError={displayError}
                            forceRerenderExpandableRow={forceRerenderExpandableRow}
                        />
                    </TableCell>
                    <TableCell className={classes.parentNameCell} size="small">
                        {appointment.parentFirstName} {appointment.parentLastName}
                    </TableCell>
                    <TableCell size="small">
                        {emailSent ? (
                            <CheckIcon className={classes.checkIcon} />
                        ) : (
                            <ClearIcon className={classes.clearIcon} />
                        )}
                    </TableCell>
                    <EnrolmentStatusCell status={enrolmentStatus} />
                    <InvoiceStatusWithAction
                        appointment={appointment}
                        setEnrolmentStatus={setEnrolmentStatus}
                        setEmailSent={setEmailSent}
                    />
                </TableRow>
                {expanded && (
                    <>
                        <TableRow className={classes.appointmentDetailsRow}>
                            <TableCell className={classes.appointmentDetailsCell} colSpan={7}>
                                <Table className={classes.appointmentDetailsTable}>
                                    <TableBody>
                                        <TableRow className={classes.appointmentDetailsHeaderRow}>
                                            <TableCell variant="head" width="5%" className={classes.paddingCell} />
                                            <TableCell variant="head" width="19%">
                                                Parent Phone
                                            </TableCell>
                                            <TableCell variant="head" width="19%">
                                                Parent Email
                                            </TableCell>
                                            <TableCell variant="head" width="19%">
                                                Child Name
                                            </TableCell>
                                            <TableCell variant="head" width="19%">
                                                Child Age
                                            </TableCell>
                                            <TableCell variant="head" width="19%">
                                                Child Grade
                                            </TableCell>
                                        </TableRow>
                                        <TableRow className={classes.appointmentDetailsContentRow}>
                                            <TableCell className={classes.paddingCell} />
                                            <TableCell>{appointment.parentPhone}</TableCell>
                                            <TableCell>{appointment.parentEmail}</TableCell>
                                            <TableCell>
                                                {appointment.childFirstName} {appointment.childLastName}
                                            </TableCell>
                                            <TableCell>{appointment.childAge}</TableCell>
                                            <TableCell>{appointment.childGrade}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableCell>
                        </TableRow>
                    </>
                )}
            </>
        )
    }
}

const useStyles = makeStyles({
    summaryRow: {
        '& td': {
            textAlign: 'center',
            padding: '0px !important',
        },
    },
    parentNameCell: {
        textAlign: 'left !important' as 'left',
    },
    parentName: {
        justifySelf: 'flex-start',
        marginLeft: '80px',
    },
    checkIcon: {
        color: 'green',
    },
    clearIcon: {
        color: 'red',
    },
    appointmentDetailsRow: {
        background: 'whitesmoke',
    },
    appointmentDetailsCell: {
        paddingTop: 0,
        paddingLeft: 0,
        paddingRight: 0,
        '@media(max-width: 592px)': {
            paddingBottom: 0,
        },
    },
    appointmentDetailsHeaderRow: {
        '& td': {
            paddingLeft: 0,
        },
    },
    appointmentDetailsContentRow: {
        '& td': {
            paddingLeft: 0,
            paddingBottom: 0,
            borderBottomWidth: 0,
        },
        '@media(max-width: 592px)': {
            '& td': {
                paddingBottom: 16,
            },
        },
    },
    appointmentDetailsTable: {
        '@media(max-width: 592px)': {
            '& tr': {
                display: 'block',
                float: 'left',
                width: '50%',
            },
            '& td': {
                display: 'block',
                width: '100%',
                textAlign: 'center',
                borderBottomWidth: 1,
                minHeight: 57,
            },
        },
    },
    paddingCell: {
        '@media(max-width: 592px)': {
            display: 'none !important',
        },
        '@media(max-width: 960px)': {
            paddingLeft: '32px !important',
        },
    },
    loadingCell: {
        textAlign: 'center',
        padding: 0,
    },
    loadingSpinner: {
        padding: 8,
    },
})

export default WithErrorDialog(ExpandableTableRow)
