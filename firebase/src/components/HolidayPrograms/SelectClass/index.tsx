import { AcuityConstants, AcuityTypes, Service } from 'fizz-kidz'
import { DateTime } from 'luxon'
import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import Firebase, { FirebaseContext } from '@components/Firebase'
import * as ROUTES from '@constants/routes'
import * as Logo from '@drawables/FizzKidzLogoHorizontal.png'
import { Button, Paper } from '@mui/material'
import { Skeleton } from '@mui/material'
import AppBar from '@mui/material/AppBar'
import CssBaseline from '@mui/material/CssBaseline'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import { callAcuityClient } from '@utils/firebase/functions'
import { capitalise } from '@utils/stringUtilities'

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

    const [classes, setClasses] = useState<Service<AcuityTypes.Api.Class[]>>({ status: 'loading' })
    const [filteredClasses, setFilteredClasses] = useState<AcuityTypes.Api.Class[]>([])
    const [selectedCalendar, setSelectedCalendar] = useState<string>('')
    const [selectedClass, setSelectedClass] = useState<string>('')

    useEffect(() => {
        callAcuityClient(
            'classAvailability',
            firebase
        )({
            appointmentTypeId:
                import.meta.env.VITE_ENV === 'prod'
                    ? AcuityConstants.AppointmentTypes.HOLIDAY_PROGRAM
                    : AcuityConstants.AppointmentTypes.TEST_HOLIDAY_PROGRAM,
            includeUnavailable: true,
            minDate: Date.now(),
        })
            .then((result) => {
                setClasses({ status: 'loaded', result: result.data })
            })
            .catch((error) => setClasses({ status: 'error', error }))
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
                                    {import.meta.env.VITE_ENV === 'prod' &&
                                        Object.entries(AcuityConstants.StoreCalendars).map(([store, calendarId]) => {
                                            return (
                                                <MenuItem key={calendarId} value={calendarId}>
                                                    {capitalise(store)}
                                                </MenuItem>
                                            )
                                        })}
                                    {import.meta.env.VITE_ENV === 'dev' && (
                                        <MenuItem
                                            key={AcuityConstants.TestCalendarId}
                                            value={AcuityConstants.TestCalendarId}
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
