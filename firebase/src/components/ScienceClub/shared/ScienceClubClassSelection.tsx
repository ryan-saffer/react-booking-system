import { AcuityTypes } from 'fizz-kidz'
import { DateTime } from 'luxon'
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import useFirebase from '@components/Hooks/context/UseFirebase'
import { Button, FormControl, MenuItem, Paper, Select, SelectChangeEvent, Skeleton, Typography } from '@mui/material'
import { callAcuityClient } from '@utils/firebase/functions'

import styles from './ScienceClubClassSelection.module.css'

type Props = {
    classRoute: string
    classRequired: boolean // true means its being used for class checkin, false for invoicing
}

const ScienceClubClassSelection: React.FC<Props> = ({ classRoute, classRequired }) => {
    const firebase = useFirebase()
    const navigate = useNavigate()

    const mounted = useRef(false)

    const [loading, setLoading] = useState({ appointmentTypes: true, classes: false })
    const [appointmentTypes, setAppointmentTypes] = useState<AcuityTypes.Api.AppointmentType[]>([])
    const [selectedAppointmentType, setSelectedAppointmentType] = useState<
        AcuityTypes.Api.AppointmentType | undefined
    >()
    const [classes, setClasses] = useState<AcuityTypes.Api.Class[]>([])
    const [selectedClass, setSelectedClass] = useState<AcuityTypes.Api.Class | undefined>()

    useEffect(() => {
        mounted.current = true
        const fetchAppointmentTypes = () => {
            callAcuityClient(
                'getAppointmentTypes',
                firebase
            )({
                category: import.meta.env.VITE_ENV === 'prod' ? 'Science Club' : 'TEST',
            })
                .then((result) => {
                    if (mounted.current) {
                        setAppointmentTypes(result.data)
                    }
                })
                .catch((err) => {
                    console.error(err)
                })
                .finally(() => {
                    if (mounted.current) {
                        setLoading({ appointmentTypes: false, classes: false })
                    }
                })
        }

        fetchAppointmentTypes()

        return () => {
            mounted.current = false
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleAppointmentTypeChange = (e: SelectChangeEvent<number>) => {
        const id = e.target.value as number
        setSelectedAppointmentType(appointmentTypes.find((it) => it.id === id))
        setSelectedClass(undefined)
        // clear menu items
        setClasses([])
        fetchClasses(id)
    }

    const handleClassChange = (e: SelectChangeEvent<number>) => {
        const id = e.target.value
        setSelectedClass(classes.find((it) => it.id === id))
    }

    const handleClassSelection = () => {
        // checkin
        if (classRequired && selectedAppointmentType && selectedClass) {
            navigate(
                `${classRoute}?appointmentTypeId=${selectedAppointmentType.id}&calendarId=${
                    selectedClass.calendarID
                }&classId=${selectedClass.id}&calendarName=${encodeURIComponent(
                    selectedAppointmentType.name
                )}&classTime=${encodeURIComponent(selectedClass.time)}`
            )
        }
        // invoicing
        if (!classRequired && selectedAppointmentType) {
            navigate(
                `${classRoute}?appointmentTypeId=${selectedAppointmentType.id}&calendarName=${selectedAppointmentType.name}`
            )
        }
    }

    const fetchClasses = (id: number) => {
        setLoading({
            ...loading,
            classes: true,
        })
        callAcuityClient(
            'classAvailability',
            firebase
        )({ appointmentTypeId: id, minDate: Date.now(), includeUnavailable: true })
            .then((result) => {
                if (mounted.current) {
                    setClasses(result.data)
                }
            })
            .catch(console.error)
            .finally(() => {
                if (mounted.current) {
                    setLoading({
                        ...loading,
                        classes: false,
                    })
                }
            })
    }

    return (
        <Paper className={styles.paper}>
            <div className={styles.main}>
                {appointmentTypes.length !== 0 && (
                    <>
                        <Typography className={styles.heading} variant="body1">
                            Select program:
                        </Typography>
                        <FormControl className={styles.formControl} variant="outlined">
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
                        <Typography className={styles.heading} variant="body1">
                            Select class:
                        </Typography>
                        <FormControl className={styles.formControl} variant="outlined">
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
                        className={styles.submitButton}
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

export default ScienceClubClassSelection
