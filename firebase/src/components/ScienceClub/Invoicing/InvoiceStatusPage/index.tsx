import React, { useState } from 'react'
import { withRouter, useHistory } from 'react-router-dom'
import { makeStyles, CssBaseline, AppBar, Toolbar, IconButton, Typography, Table, TableHead, TableRow, TableCell, TableBody } from '@material-ui/core'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'

import useFetchAppointments from '../../../Hooks/UseFetchAppointments'
import ExpandableTableRow from './ExpandableTableRow'
import SkeletonRows from '../../../Shared/SkeletonRows'
import useWindowDimensions from '../../../Hooks/UseWindowDimensions'
import useQueryParam from '../../../Hooks/UseQueryParam'
import { Acuity } from 'fizz-kidz'

interface QueryParams {
    appointmentTypeId: string,
    calendarId: string,
    classId: string
}

const ScienceClubInvoicingStatus = () => {

    const classes = useStyles()

    const { height } = useWindowDimensions()

    const [loading, setLoading] = useState(true)

    const history = useHistory()

    const appointmentTypeId = parseInt(useQueryParam<QueryParams>('appointmentTypeId') as string)
    const calendarId = parseInt(useQueryParam<QueryParams>('calendarId') as string)
    const classId = parseInt(useQueryParam<QueryParams>('classId') as string)

    const sortByParentName = (a: Acuity.Appointment, b: Acuity.Appointment) => {
        const aName = a.firstName
        const bName = b.firstName
        return (aName < bName) ? -1 : (aName > bName) ? 1 : 0;
    }

    const appointments = useFetchAppointments({
        setLoading,
        appointmentTypeId,
        calendarId,
        classId,
        sorter: sortByParentName
    })

    const navigateBack = () => {
        history.goBack()
    }

    return (
        <div className={classes.main}>
            <CssBaseline />
            <AppBar position="static">
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={navigateBack}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6">
                        Invoice Status
                    </Typography>
                </Toolbar>
            </AppBar>
            <Table>
                <TableHead>
                    <TableRow className={classes.headerRow}>
                        <TableCell width="5%" />
                        <TableCell width="5%" />
                        <TableCell width="15%" className={classes.parentNameCell}>Parent Name</TableCell>
                        <TableCell width="15%">Email Sent?</TableCell>
                        <TableCell width="20%">Enrolment Status</TableCell>
                        <TableCell width="20%">Invoice Status</TableCell>
                        <TableCell width="20%">Action</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {appointments !== null && appointments.map(appointment => (
                        <ExpandableTableRow key={appointment.id} appointment={appointment} />
                    ))}
                </TableBody>
            </Table>
            {loading && <SkeletonRows rowCount={(height - 64) / 64} />}
        </div>
    )
}

const useStyles = makeStyles({
    main: {
        position: 'absolute',
        top: 0, right: 0, bottom: 0, left: 0
    },
    headerRow: {
        '& th': {
            textAlign: 'center',
            paddingLeft: 0,
            paddingRight: 0
        }
    },
    parentNameCell: {
        textAlign: 'left !important' as 'left'
    }
})

export default withRouter(ScienceClubInvoicingStatus)