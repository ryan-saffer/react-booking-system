import React, { useState, useEffect, useContext } from 'react'
import moment from 'moment'

import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { Button, Paper } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab'
import { withRouter } from 'react-router-dom';
import { FirebaseContext } from '../Firebase';

const ScienceClubClassSelection = props => {

    const cssClasses = useStyles()

    const { classRoute } = props

    const firebase = useContext(FirebaseContext)

    const [loading, setLoading] = useState({ calendar: true, appointmentTypes: false, classes: false })
    const [calendars, setCalendars] = useState([])
    const [selectedCalendar, setSelectedCalendar] = useState('')
    const [appointmentTypes, setAppointmentTypes] = useState([])
    const [selectedAppointmentType, setSelectedAppointmentType] = useState('')
    const [classes, setClasses] = useState([])
    const [selectedClass, setSelectedClass] = useState('')

    useEffect(() => {

        const fetchCalendars = () => {
            firebase.functions.httpsCallable('acuityClient')({
                auth: firebase.auth.currentUser.toJSON(),
                data: {method: 'getCalendars'}
            }).then(result => {
                console.log(result.data)
                setCalendars(result.data)
                setLoading({ calendar: false, appointmentTypes: false, classes: false })
            }).catch(err => {
                console.error(err)
                setLoading({ calendar: false, appointmentTypes: false, classes: false })
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
        props.history.push(`${classRoute}?appointmentTypeId=${selectedClass.appointmentTypeID}&calendarId=${selectedClass.calendarID}&classId=${selectedClass.id}`)
    }

    const fetchAppointmentTypes = id => {
        console.log("FETCHING APPOINTMENTS WITH ID: " + id)
        setLoading({
            ...loading,
            appointmentTypes: true
        })
        firebase.functions.httpsCallable('acuityClient')({
            auth: firebase.auth.currentUser.toJSON(),
            data: {method: "getAppointmentTypes"}
        }).then(result => {
            console.log(result.data)
            setAppointmentTypes(
                result.data.filter(x => x.calendarIDs.includes(id))
            )
            setLoading({
                ...loading,
                appointmentTypes: false
            })
        }).catch(err => {
            console.error(err)
            setLoading({
                ...loading,
                appointmentTypes: false
            })
        })
    }

    const fetchClasses = id => {
        console.log(id)
        setLoading({
            ...loading,
            classes: true
        })
        firebase.functions.httpsCallable('acuityClient')({
            auth: firebase.auth.currentUser.toJSON(),
            data: { method: "getClasses", id }
        }).then(result => {
            console.log(result)
            setClasses(result.data)
            setLoading({
                ...loading,
                classes: false
            })
        }).catch(err => {
            console.error(err)
            setLoading({
                ...loading,
                classes: false
            })
        })
    }

    return (
        <Paper className={cssClasses.paper}>
            <div className={cssClasses.main}>
                {!loading.calendar ? <>
                    <Typography className={cssClasses.heading} variant="body1">Select location:</Typography>
                    <FormControl className={cssClasses.formControl} variant="outlined">
                        <Select
                            id="calendars-select"
                            value={selectedCalendar}
                            onChange={handleCalendarChange}
                            disabled={calendars.length === 0}
                        >
                            {calendars.map(calendar => {
                                const menuItem = <MenuItem key={calendar.id} value={calendar.id}>{calendar.name}</MenuItem>
                                if (process.env.REACT_APP_ENV == 'prod') {
                                    // only show science club appointments
                                    if (calendar.name.endsWith("Science Club")) {
                                        return menuItem
                                    }
                                } else {
                                    // only show test calendar
                                    if (calendar.name === "TEST CALENDAR") {
                                        return menuItem
                                    }
                                }
                            })}
                        </Select>
                    </FormControl>
                </> : <Skeleton height={80} />}
                
                {appointmentTypes.length !== 0 && <>
                    <Typography className={cssClasses.heading} variant="body1">Select program:</Typography>
                    <FormControl className={cssClasses.formControl} variant="outlined">
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
                </>}
                {loading.appointmentTypes && <Skeleton height={80} />}
                
                {classes.length !== 0 && <>
                    <Typography className={cssClasses.heading} variant="body1">Select class:</Typography>
                    <FormControl className={cssClasses.formControl} variant="outlined">
                        <Select
                            id="classes-select"
                            value={selectedClass}
                            onChange={handleClassChange}
                            disabled={classes.length === 0}
                        >
                            {classes.map(mClass => (
                                <MenuItem key={mClass.id} value={mClass}>
                                    {moment(mClass.time).format('dddd, MMMM Do, YYYY')}
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
                </>}
                {loading.classes && <Skeleton height={80} />}
            </div>
        </Paper>
    )
}

const useStyles = makeStyles(theme => ({
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
        width: '100%'
    },
    formControl: {
        marginTop: theme.spacing(1),
        marginBottom: 16,
        minWidth: 120,
    },
    submitButton: {
        marginTop: 16
    }
}));

export default withRouter(ScienceClubClassSelection)