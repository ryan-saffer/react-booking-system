import React, { useState, useEffect } from 'react'
import { DateTime } from 'luxon'

import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import { Button, Paper } from '@material-ui/core'
import { Skeleton } from '@material-ui/lab'
import { useHistory } from 'react-router-dom'
import useFirebase from '../../Hooks/context/UseFirebase'
import { callAcuityClientV2 } from '../../../utilities/firebase/functions'
import { Acuity } from 'fizz-kidz'

type Props = {
    classRoute: string
    classRequired: boolean // true means its being used for class checkin, false for invoicing
}

const ScienceClubClassSelection: React.FC<Props> = ({ classRoute, classRequired }) => {
    const cssClasses = useStyles()

    const firebase = useFirebase()
    const history = useHistory()

    const [loading, setLoading] = useState({ appointmentTypes: true, classes: false })
    const [appointmentTypes, setAppointmentTypes] = useState<Acuity.AppointmentType[]>([])
    const [selectedAppointmentType, setSelectedAppointmentType] = useState<Acuity.AppointmentType | undefined>()
    const [classes, setClasses] = useState<Acuity.Class[]>([])
    const [selectedClass, setSelectedClass] = useState<Acuity.Class | undefined>()

    useEffect(() => {
        const fetchAppointmentTypes = () => {
            callAcuityClientV2(
                'getAppointmentTypes',
                firebase
            )({
                category: process.env.REACT_APP_ENV === 'prod' ? 'Science Club' : 'TEST',
            })
                .then((result) => {
                    setAppointmentTypes(result.data)
                })
                .catch((err) => {
                    console.error(err)
                })
                .finally(() => {
                    setLoading({ appointmentTypes: false, classes: false })
                })
        }

        fetchAppointmentTypes()
    }, [])

    const handleAppointmentTypeChange = (e: React.ChangeEvent<{ value: unknown }>) => {
        console.log(`Selected appointment type: ${e.target.value}`)
        const id = e.target.value as number
        setSelectedAppointmentType(appointmentTypes.find((it) => it.id === id))
        setSelectedClass(undefined)
        // clear menu items
        setClasses([])
        fetchClasses(id)
    }

    const handleClassChange = (e: React.ChangeEvent<{ value: unknown }>) => {
        const id = e.target.value as number
        setSelectedClass(classes.find((it) => it.id === id))
    }

    const handleClassSelection = () => {
        // checkin
        if (classRequired && selectedAppointmentType && selectedClass) {
            history.push(
                `${classRoute}?appointmentTypeId=${selectedAppointmentType.id}&calendarId=${
                    selectedClass.calendarID
                }&classId=${selectedClass.id}&calendarName=${encodeURIComponent(
                    selectedAppointmentType.name
                )}&classTime=${encodeURIComponent(selectedClass.time)}`
            )
        }
        // invoicing
        if (!classRequired && selectedAppointmentType) {
            history.push(
                `${classRoute}?appointmentTypeId=${selectedAppointmentType.id}&calendarName=${selectedAppointmentType.name}`
            )
        }
    }

    const fetchClasses = (id: number) => {
        console.log(id)
        setLoading({
            ...loading,
            classes: true,
        })
        callAcuityClientV2(
            'classAvailability',
            firebase
        )({ appointmentTypeId: id, minDate: Date.now(), includeUnavailable: true })
            .then((result) => {
                setClasses(result.data)
            })
            .catch(console.error)
            .finally(() => {
                setLoading({
                    ...loading,
                    classes: false,
                })
            })
    }

    return (
        <Paper className={cssClasses.paper}>
            <div className={cssClasses.main}>
                {appointmentTypes.length !== 0 && (
                    <>
                        <Typography className={cssClasses.heading} variant="body1">
                            Select program:
                        </Typography>
                        <FormControl className={cssClasses.formControl} variant="outlined">
                            <Select
                                id="programs-select"
                                value={selectedAppointmentType?.id || ''}
                                onChange={handleAppointmentTypeChange}
                                disabled={appointmentTypes.length === 0}
                            >
                                {appointmentTypes.map((appointmentType) => (
                                    <MenuItem key={appointmentType.id} value={appointmentType.id}>
                                        {appointmentType.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </>
                )}
                {loading.appointmentTypes && <Skeleton height={80} />}

                {classRequired && classes.length !== 0 && (
                    <>
                        <Typography className={cssClasses.heading} variant="body1">
                            Select class:
                        </Typography>
                        <FormControl className={cssClasses.formControl} variant="outlined">
                            <Select
                                id="classes-select"
                                value={selectedClass?.id || ''}
                                onChange={handleClassChange}
                                disabled={classes.length === 0}
                            >
                                {classes.map((mClass) => (
                                    <MenuItem key={mClass.id} value={mClass.id}>
                                        {DateTime.fromISO(mClass.time).toFormat('EEEE MMMM d, h:mm a, yyyy')}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </>
                )}
                {classRequired && loading.classes && <Skeleton height={80} />}
                {(!classRequired || appointmentTypes.length !== 0) && (
                    <Button
                        className={cssClasses.submitButton}
                        variant="contained"
                        color="primary"
                        disabled={!selectedAppointmentType || (classRequired && !selectedClass)}
                        onClick={handleClassSelection}
                    >
                        Select
                    </Button>
                )}
            </div>
        </Paper>
    )
}

const useStyles = makeStyles((theme) => ({
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

export default ScienceClubClassSelection
