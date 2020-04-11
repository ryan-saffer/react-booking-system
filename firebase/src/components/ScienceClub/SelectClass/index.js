import React, { useState, useEffect } from 'react'
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import LoadingOverlay from 'react-loading-overlay'

import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { Button, Paper } from '@material-ui/core';
import CssBaseline from '@material-ui/core/CssBaseline'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'

import { withAuthorization } from '../../Session'

const useStyles = makeStyles(theme => ({
    loadingOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0
    },
    appBar: {
        zIndex: theme.zIndex.drawer + 1
    },
    paper: {
        margin: theme.spacing(3),
        padding: theme.spacing(2),
        [theme.breakpoints.up(800 + theme.spacing(3) * 2)]: {
            marginTop: theme.spacing(6),
            marginBottom: theme.spacing(6),
            padding: theme.spacing(3),
        },
    },
    main: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
    },
    heading: {
        width: '30%'
    },
    formControl: {
        margin: theme.spacing(1),
        marginBottom: 16,
        minWidth: 120,
    },
    submitButton: {
        marginTop: 16
    }
}));

const SelectClassPage = props => {

    const cssClasses = useStyles()

    const { firebase } = props

    const [loading, setLoading] = useState(true)
    const [calendars, setCalendars] = useState([])
    const [selectedCalendar, setSelectedCalendar] = useState('')
    const [appointmentTypes, setAppointmentTypes] = useState([])
    const [selectedAppointmentType, setSelectedAppointmentType] = useState('')
    const [classes, setClasses] = useState([])
    const [selectedClass, setSelectedClass] = useState('')

    useEffect(() => {

        const fetchCalendars = () => {
            firebase.functions.httpsCallable('getCalendars')({
                auth: firebase.auth.currentUser.toJSON(),
                data: null
            }).then(result => {
                console.log(result.data)
                setCalendars(result.data)
                setLoading(false)
            }).catch(err => {
                console.error(err)
                setLoading(false)
            })
        }
        
        if (firebase.auth.currentUser) {
            fetchCalendars()
        }

    }, [firebase.auth.currentUser])

    const handleCalendarChange = e => {
        console.log(`Selected calendar: ${e.target.value}`)
        setSelectedCalendar(e.target.value)
        setSelectedAppointmentType('')
        setSelectedClass('')
        // clear menu items
        setAppointmentTypes([])
        setClasses([])
        fetchAppointmentTypes(e.target.value)
    }

    const handleAppointmentTypeChange = e => {
        console.log(`Selected appointment type: ${e.target.value}`)
        setSelectedAppointmentType(e.target.value)
        setSelectedClass('')
        // clear menu items
        setClasses([])
        fetchClasses(e.target.value)
    }

    const handleClassChange = e => {
        setSelectedClass(e.target.value)
    }

    const handleClassSelection = () => {
        props.history.push(`/science-club/class?appointmentTypeId=${selectedClass.appointmentTypeID}&calendarId=${selectedClass.calendarID}&classId=${selectedClass.id}`)
    }

    const fetchAppointmentTypes = id => {
        console.log("FETCHING APPOINTMENTS WITH ID: " + id)
        setLoading(true)
        firebase.functions.httpsCallable('getAppointmentTypes')({
            auth: firebase.auth.currentUser.toJSON(),
            data: null
        }).then(result => {
            console.log(result.data)
            setAppointmentTypes(
                result.data.filter(x => x.calendarIDs.includes(id))
            )
            setLoading(false)
        }).catch(err => {
            console.error(err)
            setLoading(false)
        })
    }

    const fetchClasses = id => {
        console.log(id)
        setLoading(true)
        firebase.functions.httpsCallable('getClasses')({
            auth: firebase.auth.currentUser.toJSON(),
            data: id
        }).then(result => {
            console.log(result)
            setClasses(result.data)
            setLoading(false)
        }).catch(err => {
            console.error(err)
            setLoading(false)
        })
    }

    return (
        <LoadingOverlay
            active={loading}
            spinner
            className={cssClasses.loadingOverlay}
        >
            <CssBaseline />
            <AppBar className={classes.appBar} position="static">
                <Toolbar>
                    <Typography variant="h6">
                        Select class
                    </Typography>
                </Toolbar>
            </AppBar>
            <Paper className={cssClasses.paper}>
                <div className={cssClasses.main}>
                    <Typography className={cssClasses.heading} variant="body1">Select calendar:</Typography>
                    <FormControl className={cssClasses.formControl}>
                        <InputLabel>Calendar</InputLabel>
                        <Select
                            id="calendars-select"
                            value={selectedCalendar}
                            onChange={handleCalendarChange}
                            disabled={calendars.length === 0}
                        >
                            {calendars.map(calendar => (
                                <MenuItem key={calendar.id} value={calendar.id}>{calendar.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    
                    <Typography className={cssClasses.heading} variant="body1">Select program:</Typography>
                    <FormControl className={cssClasses.formControl}>
                        <InputLabel>Program</InputLabel>
                        <Select
                            id="programs-select"
                            value={selectedAppointmentType}
                            onChange={handleAppointmentTypeChange}
                            disabled={appointmentTypes.length === 0}
                        >
                            {appointmentTypes.map(appointmentType => (
                                <MenuItem key={appointmentType.id} value={appointmentType.id}>{appointmentType.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    
                    <Typography className={cssClasses.heading} variant="body1">Select class:</Typography>
                    <FormControl className={cssClasses.formControl}>
                        <InputLabel>Class</InputLabel>
                        <Select
                            id="classes-select"
                            value={selectedClass}
                            onChange={handleClassChange}
                            disabled={classes.length === 0}
                        >
                            {classes.map(mClass => (
                                <MenuItem key={mClass.id} value={mClass}>
                                    {new Date(mClass.time).toLocaleDateString(
                                        "en-US",
                                        { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
                                    )}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Button
                        className={cssClasses.submitButton}
                        variant="contained"
                        color="primary"
                        disabled={selectedCalendar === '' || selectedAppointmentType === '' || selectedClass === ''}
                        onClick={handleClassSelection}
                    >
                        Select
                    </Button>
                </div>
            </Paper>
        </LoadingOverlay>
    )
}

export default compose(
    withRouter,
    withAuthorization,
)(SelectClassPage)