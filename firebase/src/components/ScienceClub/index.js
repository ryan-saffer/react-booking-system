import React, { useState, useEffect } from 'react'
import { withAuthorization } from '../Session'
import ChildExpansionPanel from './ChildExpansionPanel'

import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';

const useStyles = makeStyles(theme => ({
    root: {
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    }
}));

const ScienceClubPage = props => {

    const cssClasses = useStyles()

    const { firebase } = props

    const [calendars, setCalendars] = useState(null)
    const [selectedCalendar, setSelectedCalendar] = useState('')
    const [appointmentTypes, setAppointmentTypes] = useState([])
    const [selectedAppointmentType, setSelectedAppointmentType] = useState('')
    const [classes, setClasses] = useState([])
    const [selectedClass, setSelectedClass] = useState('')
    const [clients, setClients] = useState([])
    const [expanded, setExpanded] = useState(false)
    const [labels, setLabels] = useState([])

    useEffect(() => {
        firebase.auth.onAuthStateChanged(authUser => {
            if (authUser) {
                fetchCalendars()
                fetchLabels()
            }
        })
    }, [])

    const handleCalendarChange = e => {
        console.log(`Selected calendar: ${e.target.value}`)
        setSelectedCalendar(e.target.value)
        setSelectedAppointmentType('')
        setSelectedClass('')
        fetchAppointmentTypes(e.target.value)
    }

    const handleAppointmentTypeChange = e => {
        console.log(`Selected appointment type: ${e.target.value}`)
        setSelectedAppointmentType(e.target.value)
        setSelectedClass('')
        fetchClasses(e.target.value)
    }

    const handleClassChange = e => {
        console.log(`Selected class: ${e.target.value}`)
        setSelectedClass(e.target.value)
        fetchClients(e.target.value)
    }

    const handleClientSelectionChange = panel => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false)
    }

    const handleClientUpdated = client => {
        const idx = clients.findIndex(x => x.id === client.id)
        var tmpClients = clients
        tmpClients[idx] = client
        setClients(tmpClients)
    }

    const fetchAppointmentTypes = id => {
        console.log("FETCHING APPOINTMENTS WITH ID: " + id)
        firebase.functions.httpsCallable('getAppointmentTypes')({
            auth: firebase.auth.currentUser.toJSON(),
            data: null
        }).then(result => {
            console.log(result.data)
            setAppointmentTypes(
                result.data.filter(x => x.calendarIDs.includes(id))
            )
        }).catch(err => {
            console.error(err)
        })
    }

    const fetchCalendars = () => {
        firebase.functions.httpsCallable('getCalendars')({
            auth: firebase.auth.currentUser.toJSON(),
            data: null
        }).then(result => {
            console.log(result.data)
            setCalendars(result.data)
        }).catch(err => {
            console.error(err)
        })
    }

    const fetchClasses = id => {
        console.log(id)
        firebase.functions.httpsCallable('getClasses')({
            auth: firebase.auth.currentUser.toJSON(),
            data: id
        }).then(result => {
            console.log(result)
            setClasses(result.data)
        }).catch(err => {
            console.error(err)
        })
    }

    const fetchClients = mClass => {
        console.log(mClass)
        firebase.functions.httpsCallable('getAppointments')({
            auth: firebase.auth.currentUser.toJSON(),
            data: mClass
        }).then(result => {
            console.log(result)
            setClients(
                result.data.filter(x => x.classID === mClass.id)
            )
        }).catch(err => {
            console.error(err)
        })
    }

    const fetchLabels = () => {
        firebase.functions.httpsCallable('getLabels')({
            auth: firebase.auth.currentUser.toJSON(),
            data: null
        }).then(result => {
            console.log(result.data)
            setLabels(result.data)
        }).catch(err => {
            console.error(err)
        })
    }

    return (
        <div className={cssClasses.root}>

            {calendars ?
                <>
                    <Typography variant="h6">Calendars:</Typography>
                    <FormControl className={cssClasses.formControl}>
                        <InputLabel>Calendar</InputLabel>
                        <Select
                            id="calendars-select"
                            value={selectedCalendar}
                            onChange={handleCalendarChange}
                        >
                            {calendars.map(calendar => (
                                <MenuItem key={calendar.id} value={calendar.id}>{calendar.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </> : <p>Fetching calendars...</p>
            }

            <Typography variant="h6">Programs:</Typography>
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

            <Typography variant="h6">Classes:</Typography>
            <FormControl className={cssClasses.formControl}>
                <InputLabel>Class</InputLabel>
                <Select
                    id="classes-select"
                    value={selectedClass}
                    onChange={handleClassChange}
                    disabled={classes.length == 0}
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

            <Typography variant='h6'>Children:</Typography>
            {clients.map(client => (
                <ChildExpansionPanel
                    key={client.id}
                    client={client}
                    onClientSelectionChange={handleClientSelectionChange}
                    expanded={expanded}
                />
            ))}
        </div>
    )
}

export default withAuthorization(ScienceClubPage)