import React, { useState } from 'react'
import { withRouter } from 'react-router-dom'
import queryString from 'query-string'

import ChildExpansionPanel from './ChildExpansionPanel'
import useWindowDimensions from '../../Hooks/UseWindowDimensions'
import { Acuity } from 'fizz-kidz'

import CssBaseline from '@material-ui/core/CssBaseline'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import IconButton from '@material-ui/core/IconButton'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import SkeletonRows from '../../Shared/SkeletonRows'
import useFetchAppointments from '../../Hooks/UseFetchAppointments'

const ClassDetailsPage = props => {
    
    const classes = useStyles()

    const { height } = useWindowDimensions()

    const [expanded, setExpanded] = useState(false)
    const [loading, setLoading] = useState(true)

    const queries = queryString.parse(props.location.search)
    const appointmentTypeId = queries.appointmentTypeId
    const calendarId = queries.calendarId
    const classId = parseInt(queries.classId)

    const sortByChildName = (a, b) => {
        const aName = Acuity.Utilities.retrieveFormAndField(a, Acuity.Constants.Forms.CHILDREN_DETAILS, Acuity.Constants.FormFields.CHILDREN_NAMES)
        const bName = Acuity.Utilities.retrieveFormAndField(b, Acuity.Constants.Forms.CHILDREN_DETAILS, Acuity.Constants.FormFields.CHILDREN_NAMES)
        return (aName < bName) ? -1 : (aName > bName) ? 1 : 0;
    }

    const appointments = useFetchAppointments({
        setLoading,
        appointmentTypeId,
        calendarId,
        classId,
        sorter: sortByChildName
    })

    const navigateBack = () => {
        props.history.goBack()
    }
    const handleClientSelectionChange = panel => (_, isExpanded) => {
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
                    <Typography variant="h6" color='inherit'>
                        Children
                    </Typography>
                </Toolbar>
            </AppBar>
            {appointments !== null ? appointments.map(appointment => (
                <ChildExpansionPanel
                    key={appointment.id}
                    appointment={appointment}
                    onClientSelectionChange={handleClientSelectionChange}
                    expanded={expanded}
                />
            )) : <Typography className={classes.noEnrolments} variant="h5">No one is enrolled</Typography>}
            {loading && <SkeletonRows rowCount={(height - 64) / 64} />}
        </div>
    )
}

const useStyles = makeStyles({
    main: {
        position: 'absolute',
        top: 0, right: 0, bottom: 0, left: 0
    },
    noEnrolments: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%',
        position: 'absolute',
        top: 0, left: 0,
        color: 'grey',
        pointerEvents: 'none'
    },
    skeleton: {
        margin: '0px 24px 0px 24px'
    }
})

export default withRouter(ClassDetailsPage)