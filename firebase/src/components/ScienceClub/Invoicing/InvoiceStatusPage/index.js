import React, { useState } from 'react'
import { withRouter } from 'react-router-dom'
import queryString from 'query-string'
import { makeStyles, CssBaseline, AppBar, Toolbar, IconButton, Typography, Table, TableHead, TableRow, TableCell, TableBody } from '@material-ui/core'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'

import useFetchAppointments from '../../../Hooks/UseFetchAppointments'
import ExpandableTableRow from './ExpandableTableRow'
import SkeletonRows from '../../../Shared/SkeletonRows'
import useWindowDimensions from '../../../Hooks/UseWindowDimensions'

const ScienceClubInvoicingStatus = props => {

    const classes = useStyles()

    const { height } = useWindowDimensions()

    const [loading, setLoading] = useState(true)

    const queries = queryString.parse(props.location.search)
    const appointmentTypeID = queries.appointmentTypeId
    const calendarID = queries.calendarId
    const classID = parseInt(queries.classId)

    const sortByParentName = (a, b) => {
        const aName = a.firstName
        const bName = b.firstName
        return (aName < bName) ? -1 : (aName > bName) ? 1 : 0;
    }

    const appointments = useFetchAppointments({
        setLoading,
        appointmentTypeID,
        calendarID,
        classID,
        sorter: sortByParentName
    })

    const navigateBack = () => {
        props.history.goBack()
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
                        <TableCell width="45%" className={classes.parentNameCell}>Parent Name</TableCell>
                        <TableCell width="25%">Invoice Status</TableCell>
                        <TableCell width="25%">Action</TableCell>
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
        textAlign: 'left !important'
    }
})

export default withRouter(ScienceClubInvoicingStatus)