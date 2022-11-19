import React, { useState, useEffect, useContext } from 'react'
import { withRouter } from 'react-router-dom'
import { compose } from 'recompose'
import { DateTime } from 'luxon'

import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import { Button, Paper } from '@material-ui/core'
import CssBaseline from '@material-ui/core/CssBaseline'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import { Skeleton } from '@material-ui/lab'
import * as Logo from '../../../drawables/FizzKidzLogoHorizontal.png'
import * as ROUTES from '../../../constants/routes'

import { withAuthorization } from '../../Session'
import { Acuity, Service } from 'fizz-kidz'
import { capitalise } from '../../../utilities/stringUtilities'
import { callAcuityClient } from '../../../utilities/firebase/functions'
import Firebase, { FirebaseContext } from '../../Firebase'

const HolidayProgramSelection = (props: any) => {
    const cssClasses = useStyles()

    const firebase = useContext(FirebaseContext) as Firebase

    const [classes, setClasses] = useState<Service<Acuity.Class[]>>({ status: 'loading' })
    const [filteredClasses, setFilteredClasses] = useState<Acuity.Class[]>([])
    const [selectedCalendar, setSelectedCalendar] = useState<string>('')
    const [selectedClass, setSelectedClass] = useState<string>('')

    useEffect(() => {
        callAcuityClient(
            'classAvailability',
            firebase
        )({
            appointmentTypeId:
                process.env.REACT_APP_ENV === 'prod'
                    ? Acuity.Constants.AppointmentTypes.HOLIDAY_PROGRAM
                    : Acuity.Constants.AppointmentTypes.TEST_HOLIDAY_PROGRAM,
            includeUnavailable: true,
            minDate: Date.now(),
        })
            .then((result) => {
                setClasses({ status: 'loaded', result: result.data })
            })
            .catch((error) => setClasses({ status: 'error', error }))
    }, [])

    useEffect(() => {
        setSelectedClass('')
        if (classes.status === 'loaded') {
            setFilteredClasses(classes.result.filter((it) => it.calendarID === parseInt(selectedCalendar)))
        }
    }, [selectedCalendar, classes])

    const handleClassSelection = () => {
        if (classes.status === 'loaded') {
            const klass = classes.result.find((it) => it.id === parseInt(selectedClass))
            if (!klass) return
            let formattedClass = DateTime.fromISO(klass.time).toLocaleString({
                weekday: 'short',
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            })
            props.history.push(
                `/holiday-program/class?appointmentTypeId=${klass.appointmentTypeID}&calendarId=${
                    klass.calendarID
                }&classId=${klass.id}&class=${encodeURIComponent(formattedClass)}`
            )
        }
    }

    return (
        <>
            <CssBaseline />
            <AppBar className={cssClasses.appBar} position="static">
                <Toolbar className={cssClasses.toolbar}>
                    <Typography variant="h6" color="inherit">
                        Holiday Programs
                    </Typography>
                    <img
                        className={cssClasses.logo}
                        src={Logo.default}
                        onClick={() => props.history.push(ROUTES.LANDING)}
                    />
                </Toolbar>
            </AppBar>
            <Paper className={cssClasses.paper}>
                <div className={cssClasses.main}>
                    {
                        <>
                            <Typography className={cssClasses.heading} variant="body1">
                                Select location:
                            </Typography>
                            <FormControl className={cssClasses.formControl} variant="outlined">
                                <Select
                                    id="calendars-select"
                                    value={selectedCalendar}
                                    onChange={(e) => setSelectedCalendar(e.target.value as string)}
                                >
                                    {process.env.REACT_APP_ENV === 'prod' &&
                                        Object.entries(Acuity.Constants.StoreCalendars).map(([store, calendarId]) => {
                                            return (
                                                <MenuItem key={calendarId} value={calendarId}>
                                                    {capitalise(store)}
                                                </MenuItem>
                                            )
                                        })}
                                    {process.env.REACT_APP_ENV === 'dev' && (
                                        <MenuItem
                                            key={Acuity.Constants.TestCalendarId}
                                            value={Acuity.Constants.TestCalendarId}
                                        >
                                            Test Calendar
                                        </MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                        </>
                    }

                    {selectedCalendar && filteredClasses.length !== 0 && (
                        <>
                            <Typography className={cssClasses.heading} variant="body1">
                                Select class:
                            </Typography>
                            <FormControl className={cssClasses.formControl} variant="outlined">
                                <Select
                                    id="classes-select"
                                    value={selectedClass}
                                    onChange={(e) => setSelectedClass(e.target.value as string)}
                                >
                                    {filteredClasses.map((mClass) => {
                                        const midnight = DateTime.now().set({ hour: 0 })
                                        const classDateTime = DateTime.fromISO(mClass.time)
                                        if (classDateTime > midnight) {
                                            return (
                                                <MenuItem key={mClass.id} value={mClass.id}>
                                                    {classDateTime.toFormat('EEEE MMMM d, h:mm a, yyyy')}
                                                </MenuItem>
                                            )
                                        }
                                    })}
                                </Select>
                            </FormControl>
                            <Button
                                className={cssClasses.submitButton}
                                variant="contained"
                                color="primary"
                                onClick={handleClassSelection}
                            >
                                Select
                            </Button>
                        </>
                    )}
                    {selectedCalendar && classes.status === 'loading' && <Skeleton height={80} />}
                </div>
            </Paper>
        </>
    )
}

const useStyles = makeStyles((theme) => ({
    appBar: {
        zIndex: theme.zIndex.drawer + 1,
    },
    toolbar: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    logo: {
        height: 50,
        cursor: 'pointer',
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
        justifyContent: 'center',
    },
    heading: {
        width: '100%',
    },
    formControl: {
        marginTop: theme.spacing(1),
        marginBottom: 16,
        minWidth: 120,
    },
    submitButton: {
        marginTop: 16,
    },
}))

export default compose(withRouter, withAuthorization)(HolidayProgramSelection)
