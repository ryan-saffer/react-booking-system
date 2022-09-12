import React, { useContext, useEffect, useState } from 'react'
import { withRouter, useHistory } from 'react-router-dom'
import {
    makeStyles,
    CssBaseline,
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Divider,
} from '@material-ui/core'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'

import ExpandableTableRow from './ExpandableTableRow'
import SkeletonRows from '../../../Shared/SkeletonRows'
import useWindowDimensions from '../../../Hooks/UseWindowDimensions'
import useQueryParam from '../../../Hooks/UseQueryParam'
import { Acuity, ScienceAppointment } from 'fizz-kidz'
import Firebase, { FirebaseContext } from '../../../Firebase'

interface QueryParams {
    appointmentTypeId: string
    calendarName: string
    // calendarId: string
}

const ScienceClubInvoicingStatus = () => {
    const classes = useStyles()

    const firebase = useContext(FirebaseContext) as Firebase

    const { height } = useWindowDimensions()

    const [loading, setLoading] = useState(true)
    const [appointments, setAppointments] = useState<ScienceAppointment[]>([])

    const history = useHistory()

    const appointmentTypeId = parseInt(useQueryParam<QueryParams>('appointmentTypeId') as string)
    // const calendarId = parseInt(useQueryParam<QueryParams>('calendarId') as string)
    const calendarName = decodeURIComponent(useQueryParam<QueryParams>('calendarName') ?? '')

    useEffect(() => {
        console.log(`Fetching appointments with appointmentTypeId: ${appointmentTypeId}`)
        firebase.db
            .collection('scienceAppointments')
            .where('appointmentTypeId', '==', appointmentTypeId)
            .where('status', '==', 'active')
            .get()
            .then((result) => {
                let appointments = result.docs.map((appointment) => {
                    return {
                        ...(appointment.data() as ScienceAppointment),
                        id: appointment.id,
                    }
                })
                appointments = appointments.sort(sortByParentName)
                setAppointments(appointments)
                setLoading(false)
            })
    }, [])

    const sortByParentName = (a: ScienceAppointment, b: ScienceAppointment) => {
        const aName = a.parentFirstName
        const bName = b.parentFirstName
        return aName < bName ? -1 : aName > bName ? 1 : 0
    }

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
                    <Typography variant="h6" color="inherit">
                        Invoice Status
                    </Typography>
                </Toolbar>
            </AppBar>
            <Typography variant="h6" className={classes.calendarName}>
                {calendarName}
            </Typography>
            <Divider />
            <Table>
                <TableHead>
                    <TableRow className={classes.headerRow}>
                        <TableCell width="5%" />
                        <TableCell width="5%" />
                        <TableCell width="15%" className={classes.parentNameCell}>
                            Parent Name
                        </TableCell>
                        <TableCell width="15%">Email Sent?</TableCell>
                        <TableCell width="20%">Enrolment Status</TableCell>
                        <TableCell width="20%">Invoice Status</TableCell>
                        <TableCell width="20%">Action</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {appointments.length !== 0 ? (
                        appointments.map((appointment) => (
                            <ExpandableTableRow key={appointment.id} appointment={appointment} />
                        ))
                    ) : (
                        <TableRow>
                            <TableCell className={classes.noEnrolments}>No one is enrolled</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            {loading && <SkeletonRows rowCount={(height - 64) / 64} />}
        </div>
    )
}

const useStyles = makeStyles({
    main: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    },
    headerRow: {
        '& th': {
            textAlign: 'center',
            paddingLeft: 0,
            paddingRight: 0,
        },
    },
    parentNameCell: {
        textAlign: 'left !important' as 'left',
    },
    noEnrolments: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        color: 'grey',
        pointerEvents: 'none',
        borderBottom: 0,
        fontSize: '1.5rem',
    },
    calendarName: {
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 10,
    },
})

export default withRouter(ScienceClubInvoicingStatus)
