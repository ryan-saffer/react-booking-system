import React, { useState, useEffect, useContext } from 'react'
import { styled } from '@mui/material/styles'
import { useNavigate } from 'react-router-dom'
import { DateTime } from 'luxon'

import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import { Button, Paper } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import { Skeleton } from '@mui/material'
import * as Logo from '../../../drawables/FizzKidzLogoHorizontal.png'
import * as ROUTES from '../../../constants/routes'

import { Acuity, Service } from 'fizz-kidz'
import { capitalise } from '../../../utilities/stringUtilities'
import { callAcuityClient } from '../../../utilities/firebase/functions'
import Firebase, { FirebaseContext } from '../../Firebase'

const PREFIX = 'HolidayProgramSelection'

const cssClasses = {
    appBar: `${PREFIX}-appBar`,
    toolbar: `${PREFIX}-toolbar`,
    logo: `${PREFIX}-logo`,
    paper: `${PREFIX}-paper`,
    main: `${PREFIX}-main`,
    heading: `${PREFIX}-heading`,
    formControl: `${PREFIX}-formControl`,
    submitButton: `${PREFIX}-submitButton`,
}

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')(({ theme }) => ({
    [`& .${cssClasses.appBar}`]: {
        zIndex: theme.zIndex.drawer + 1,
    },

    [`& .${cssClasses.toolbar}`]: {
        display: 'flex',
    },

    [`& .${cssClasses.logo}`]: {
        height: 50,
        cursor: 'pointer',
        position: 'absolute',
        left: '50%',
        right: '50%',
        transform: 'translate(-50%)',
    },

    [`& .${cssClasses.paper}`]: {
        margin: theme.spacing(3),
        padding: theme.spacing(2),
        [theme.breakpoints.up(800 + parseInt(theme.spacing(3).substring(-2)) * 2)]: {
            marginTop: theme.spacing(6),
            marginBottom: theme.spacing(6),
            padding: theme.spacing(3),
        },
    },

    [`& .${cssClasses.main}`]: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
    },

    [`& .${cssClasses.heading}`]: {
        width: '100%',
    },

    [`& .${cssClasses.formControl}`]: {
        marginTop: theme.spacing(1),
        marginBottom: 16,
        minWidth: 120,
    },

    [`& .${cssClasses.submitButton}`]: {
        marginTop: 16,
    },
}))

export const HolidayProgramSelection = () => {
    const firebase = useContext(FirebaseContext) as Firebase

    const navigate = useNavigate()

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
            navigate(
                `/holiday-program/class?appointmentTypeId=${klass.appointmentTypeID}&calendarId=${
                    klass.calendarID
                }&classId=${klass.id}&classTime=${encodeURIComponent(klass.time)}`
            )
        }
    }

    return (
        <Root>
            <CssBaseline />
            <AppBar className={cssClasses.appBar} position="static">
                <Toolbar className={cssClasses.toolbar}>
                    <Typography variant="h6" color="inherit">
                        Holiday Programs
                    </Typography>
                    <img
                        className={cssClasses.logo}
                        src={Logo.default}
                        onClick={() => navigate(ROUTES.LANDING)}
                        alt="Fizz Kidz Logo"
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
                                        } else return ''
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
        </Root>
    )
}
