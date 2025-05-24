import type { AcuityTypes } from 'fizz-kidz'
import { Location } from 'fizz-kidz'
import { DateTime } from 'luxon'
import React, { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import type { SelectChangeEvent } from '@mui/material'
import { Button, FormControl, MenuItem, Paper, Select, Skeleton, Typography } from '@mui/material'
import { Label } from '@ui-components/label'
import { Switch } from '@ui-components/switch'
import { trpc } from '@utils/trpc'

import styles from './after-school-program-class-selection.module.css'

const PREV_CLASSES_CACHE_KEY = 'show-previous-classes'

type Props = {
    classRoute: string
    classRequired: boolean // true means its being used for class checkin, false for invoicing
}

export const AfterSchoolProgramClassSelection: React.FC<Props> = ({ classRoute, classRequired }) => {
    const navigate = useNavigate()

    const [showPreviousClasses, setShowPreviousClasses] = useState(
        (localStorage.getItem(PREV_CLASSES_CACHE_KEY) ?? 'false') === 'true'
    )
    const nowRef = useRef(showPreviousClasses ? 1704027600000 : Date.now())

    const [selectedAppointmentType, setSelectedAppointmentType] = useState<
        AcuityTypes.Api.AppointmentType | undefined
    >()
    const [selectedClass, setSelectedClass] = useState<AcuityTypes.Api.Class | undefined>()

    const { data: appointmentTypes, isLoading: loadingAppointmentTypes } = trpc.acuity.getAppointmentTypes.useQuery({
        category:
            import.meta.env.VITE_ENV === 'prod'
                ? [
                      'Science Club',
                      'Art Program',
                      ...Object.values(Location).flatMap((it) => [`science-${it}` as const, `art-${it}` as const]),
                  ]
                : ['TEST', 'TEST-science', 'TEST-art', 'test-after-school-in-studio'],
    })

    const { data: classes, isLoading: loadingClasses } = trpc.acuity.classAvailability.useQuery(
        {
            appointmentTypeIds: selectedAppointmentType?.id ? [selectedAppointmentType.id] : [],
            includeUnavailable: true,
            minDate: nowRef.current,
        },
        {
            enabled: !!selectedAppointmentType?.id,
        }
    )

    const handleAppointmentTypeChange = (e: SelectChangeEvent<number>) => {
        const id = e.target.value as number
        setSelectedAppointmentType(appointmentTypes?.find((it) => it.id === id))
        setSelectedClass(undefined)
    }

    const handleClassChange = (e: SelectChangeEvent<number>) => {
        const id = e.target.value
        setSelectedClass(classes?.find((it) => it.id === id))
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

    return (
        <Paper className={styles.paper}>
            <div className={styles.main}>
                {appointmentTypes && appointmentTypes.length !== 0 && (
                    <>
                        <Typography className={styles.heading} variant="body1">
                            Select program:
                        </Typography>
                        <FormControl className={styles.formControl} variant="outlined">
                            <Select
                                id="programs-select"
                                value={selectedAppointmentType?.id || ''}
                                onChange={handleAppointmentTypeChange}
                                disabled={appointmentTypes?.length === 0}
                            >
                                {appointmentTypes?.map((appointmentType) => (
                                    <MenuItem key={appointmentType.id} value={appointmentType.id}>
                                        {appointmentType.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </>
                )}
                {loadingAppointmentTypes && <Skeleton height={80} />}

                {classRequired && classes && classes.length !== 0 && (
                    <>
                        <Typography className={styles.heading} variant="body1">
                            Select class:
                        </Typography>
                        <FormControl className={styles.formControl} variant="outlined">
                            <Select
                                id="classes-select"
                                value={selectedClass?.id || ''}
                                onChange={handleClassChange}
                                disabled={classes?.length === 0}
                            >
                                {classes?.map((mClass) => (
                                    <MenuItem key={mClass.id} value={mClass.id}>
                                        {DateTime.fromISO(mClass.time).toFormat('EEEE MMMM d, h:mm a, yyyy')}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </>
                )}
                {classRequired && selectedAppointmentType && loadingClasses && <Skeleton height={80} />}
                {classRequired && selectedAppointmentType && (
                    <div className="twp flex items-center space-x-2 self-end">
                        <Switch
                            id="past-classes"
                            checked={showPreviousClasses}
                            onCheckedChange={(checked) => {
                                if (checked) {
                                    nowRef.current = 1704027600000 // 01/01/24
                                    setShowPreviousClasses(true)
                                    localStorage.setItem(PREV_CLASSES_CACHE_KEY, 'true')
                                } else {
                                    nowRef.current = Date.now()
                                    setShowPreviousClasses(false)
                                    localStorage.setItem(PREV_CLASSES_CACHE_KEY, 'false')
                                }
                            }}
                        />
                        <Label htmlFor="past-classes">Show past classes</Label>
                    </div>
                )}
                {(!classRequired || appointmentTypes?.length !== 0) && (
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
