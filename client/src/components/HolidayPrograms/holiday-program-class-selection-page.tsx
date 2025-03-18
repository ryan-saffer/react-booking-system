import { AcuityConstants, AcuityTypes } from 'fizz-kidz'
import { DateTime } from 'luxon'
import { useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { Button, Paper } from '@mui/material'
import { Skeleton } from '@mui/material'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import { capitalise } from '@utils/stringUtilities'
import { trpc } from '@utils/trpc'

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
        padding: theme.spacing(2),
        // [theme.breakpoints.up(800 + parseInt(theme.spacing(3).substring(-2)) * 2)]: {
        //     marginTop: theme.spacing(6),
        //     marginBottom: theme.spacing(6),
        //     padding: theme.spacing(3),
        // },
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

export const HolidayProgramSelectionPage = () => {
    const [searchParams] = useSearchParams()
    const appointmentTypeId = parseInt(searchParams.get('id') || '0') as AcuityConstants.AppointmentTypeValue

    const nowRef = useRef(Date.now())

    const navigate = useNavigate()

    const [filteredClasses, setFilteredClasses] = useState<AcuityTypes.Api.Class[]>([])
    const [selectedCalendar, setSelectedCalendar] = useState<string>('')
    const [selectedClass, setSelectedClass] = useState<string>('')

    const {
        data: classes,
        isLoading,
        isSuccess,
    } = trpc.acuity.classAvailability.useQuery({
        appointmentTypeId:
            import.meta.env.VITE_ENV === 'prod'
                ? appointmentTypeId
                : AcuityConstants.AppointmentTypes.TEST_HOLIDAY_PROGRAM,
        includeUnavailable: true,
        minDate: nowRef.current,
    })

    const handleCalendarChange = (event: SelectChangeEvent<string>) => {
        const calendar = event.target.value
        setSelectedCalendar(calendar)
        setSelectedClass('')
        if (isSuccess) {
            setFilteredClasses(classes.filter((it) => it.calendarID === parseInt(calendar)))
        }
    }

    const handleClassSelection = () => {
        if (isSuccess) {
            const klass = classes.find((it) => it.id === parseInt(selectedClass))
            if (!klass) return
            navigate(
                `class?appointmentTypeId=${klass.appointmentTypeID}&calendarId=${
                    klass.calendarID
                }&classId=${klass.id}&classTime=${encodeURIComponent(klass.time)}`
            )
        }
    }

    const renderProgramTitle = () => {
        switch (appointmentTypeId) {
            case AcuityConstants.AppointmentTypes.HOLIDAY_PROGRAM:
            case AcuityConstants.AppointmentTypes.TEST_HOLIDAY_PROGRAM:
                return 'Holiday Programs'
            case AcuityConstants.AppointmentTypes.KINGSVILLE_OPENING:
                return 'Kingsville Opening'
            default: {
                const exhaustive: never = appointmentTypeId
                throw new Error(`Unhandled appointment type in renderProgramTitle(): ${exhaustive}`)
            }
        }
    }

    return (
        <Root className="flex justify-center bg-slate-100 px-4 dashboard-full-screen">
            <div className="w-full max-w-5xl">
                <h1 className="lilita text-2xl">{renderProgramTitle()}</h1>
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
                                        onChange={handleCalendarChange}
                                    >
                                        {import.meta.env.VITE_ENV === 'prod' &&
                                            Object.entries(AcuityConstants.StoreCalendars).map(
                                                ([store, calendarId]) => {
                                                    return (
                                                        <MenuItem key={calendarId} value={calendarId}>
                                                            {capitalise(store)}
                                                        </MenuItem>
                                                    )
                                                }
                                            )}
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
                        {selectedCalendar && isLoading && <Skeleton height={80} />}
                    </div>
                </Paper>
            </div>
        </Root>
    )
}
