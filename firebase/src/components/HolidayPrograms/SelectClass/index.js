import React, { useState, useEffect } from 'react'
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { DateTime } from 'luxon'

import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { Button, Paper } from '@material-ui/core';
import CssBaseline from '@material-ui/core/CssBaseline'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import { Skeleton } from '@material-ui/lab'
import * as Logo from '../../../drawables/FizzKidzLogoHorizontal.png'
import * as ROUTES from '../../../constants/routes'

import { withAuthorization } from '../../Session'

const HolidayProgramSelection = props => {

    const cssClasses = useStyles()

    const { firebase } = props

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
        props.history.push(`/holiday-program/class?appointmentTypeId=${selectedClass.appointmentTypeID}&calendarId=${selectedClass.calendarID}&classId=${selectedClass.id}`)
    }

    const fetchAppointmentTypes = id => {
        console.log("FETCHING APPOINTMENTS WITH ID: " + id)
        setLoading(loading => {
            return {
                ...loading,
                appointmentTypes: true
            }
        })
        firebase.functions.httpsCallable('acuityClient')({
            auth: firebase.auth.currentUser.toJSON(),
            data: {method: "getAppointmentTypes"}
        }).then(result => {
            console.log(result.data)
            setAppointmentTypes(
                result.data.filter(x => x.calendarIDs.includes(id))
            )
            setLoading({ ...loading, appointmentTypes: false, })
        }).catch(err => {
            console.error(err)
            setLoading({ ...loading, appointmentTypes: false, })
        })
    }

    const fetchClasses = id => {
        console.log(id)
        setLoading(loading => {
            return {
                ...loading,
                classes: true
            }
        })
        firebase.functions.httpsCallable('acuityClient')({
            auth: firebase.auth.currentUser.toJSON(),
            data: { method: "getClasses", id }
        }).then(result => {
            console.log(result)
            setClasses(result.data.filter(x => x.calendarID === selectedCalendar))
            setLoading({ ...loading, classes: false })
        }).catch(err => {
            console.error(err)
            setLoading({ ...loading, classes: false })
        })
    }

    return (
        <>
        <CssBaseline />
        <AppBar className={cssClasses.appBar} position="static">
            <Toolbar className={cssClasses.toolbar}>
                <Typography className={cssClasses.title} variant="h6">
                    Holiday Programs
                </Typography>
                <img
                    className={cssClasses.logo}
                    src={Logo}
                    onClick={() => props.history.push(ROUTES.LANDING)} />
            </Toolbar>
        </AppBar>
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
                                if (calendar.name.endsWith("Store")) {
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
                        {appointmentTypes.map(appointmentType => {
                            if (appointmentType.name.includes("Holiday Program") || appointmentType.name.includes("Drop-in Session")) {
                                return <MenuItem key={appointmentType.id} value={appointmentType.id}>{appointmentType.name}</MenuItem>
                            }
                        })}
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
                        {classes.map(mClass => {
                            const yesterday = DateTime.now().minus({ days: 1 })
                            const classDateTime = DateTime.fromISO(mClass.time)
                            if (classDateTime > yesterday) {
                                return <MenuItem key={mClass.id} value={mClass}>
                                {classDateTime.toFormat('EEEE MMMM d, h:mm a, yyyy')}
                            </MenuItem>
                            }
                        })}
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
        </>
    )
}

const useStyles = makeStyles(theme => ({
    appBar: {
        zIndex: theme.zIndex.drawer + 1
    },
    toolbar: {
        display: 'flex',
        justifyContent: 'space-between'
    },
    logo: {
        height: 50,
        cursor: 'pointer'
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
        width: '100%'
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

export default compose(
    withRouter,
    withAuthorization,
)(HolidayProgramSelection)