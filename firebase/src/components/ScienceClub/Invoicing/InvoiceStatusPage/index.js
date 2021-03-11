import React, { useState } from 'react'
import { withRouter } from 'react-router-dom'
import queryString from 'query-string'
import { makeStyles, CssBaseline, AppBar, Toolbar, IconButton, Typography } from '@material-ui/core'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'

import useFetchAppointments from '../../../Hooks/UseFetchAppointments'
import AppointmentExpansionPanel from './AppointmentExpansionPanel'
import SkeletonRows from '../../../Shared/SkeletonRows'
import useWindowDimensions from '../../../Hooks/UseWindowDimensions'

const ScienceClubInvoicingStatus = props => {

    const classes = useStyles()

    const { height } = useWindowDimensions()

    const [loading, setLoading] = useState(true)
    const [expanded, setExpanded] = useState(false)

    const queries = queryString.parse(props.location.search)
    const appointmentTypeID = queries.appointmentTypeId
    const calendarID = queries.calendarId
    const classID = parseInt(queries.classId)

    const appointments = useFetchAppointments({
        setLoading,
        appointmentTypeID,
        calendarID,
        classID
    })

    const navigateBack = () => {
        props.history.goBack()
    }

    const handleAppointmentSelectionChange = panel => (_, isExpanded) => {
        setExpanded(isExpanded ? panel : false)
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
            {appointments !== null && appointments.map(appointment => (
                <AppointmentExpansionPanel
                    key={appointment.id}
                    appointment={appointment}
                    onAppointmentSelectionChange={handleAppointmentSelectionChange}
                    expanded={expanded}
                />
            ))}
            {loading && <SkeletonRows rowCount={(height - 64) / 64} />}
        </div>
    )
}

const useStyles = makeStyles({
    main: {
        position: 'absolute',
        top: 0, right: 0, bottom: 0, left: 0
    }
})

export default withRouter(ScienceClubInvoicingStatus)