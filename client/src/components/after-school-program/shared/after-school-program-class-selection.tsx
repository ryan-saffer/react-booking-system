import { Button, FormControl, MenuItem, Paper, Select, Skeleton, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { DateTime } from 'luxon'
import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { STUDIOS, isFranchise } from 'fizz-kidz'
import type { AcuityTypes, Studio } from 'fizz-kidz'

import { useOrg } from '@components/Session/use-org'
import { Label } from '@ui-components/label'
import { Switch } from '@ui-components/switch'
import { useTRPC } from '@utils/trpc'

import styles from './after-school-program-class-selection.module.css'

import type { SelectChangeEvent } from '@mui/material'


const PREV_CLASSES_CACHE_KEY = 'show-previous-classes'

type Props = {
    classRoute: string
    classRequired: boolean // true means its being used for class checkin, false for invoicing
}

export const AfterSchoolProgramClassSelection: React.FC<Props> = ({ classRoute, classRequired }) => {
    const trpc = useTRPC()
    const navigate = useNavigate()

    const [showPreviousClasses, setShowPreviousClasses] = useState(
        (localStorage.getItem(PREV_CLASSES_CACHE_KEY) ?? 'false') === 'true'
    )
    const [now, setNow] = useState(() => (showPreviousClasses ? 1704027600000 : Date.now()))

    const [selectedAppointmentType, setSelectedAppointmentType] = useState<
        AcuityTypes.Api.AppointmentType | undefined
    >()
    const [selectedClass, setSelectedClass] = useState<AcuityTypes.Api.Class | undefined>()

    const { data: calendars } = useQuery(trpc.acuity.getCalendars.queryOptions())

    const { currentOrg } = useOrg()

    const { data: appointmentTypes, isPending: loadingAppointmentTypes } = useQuery(
        trpc.acuity.getAppointmentTypes.queryOptions({
            category:
                import.meta.env.VITE_ENV === 'prod'
                    ? [
                          'Science Club',
                          'Art Program',
                          ...STUDIOS.flatMap((it) => [`science-${it}` as const, `art-${it}` as const]),
                      ]
                    : ['TEST', 'TEST-science', 'TEST-art', 'test-after-school-in-studio'],
        })
    )

    const { data: classes, isPending: loadingClasses } = useQuery(
        trpc.acuity.classAvailability.queryOptions(
            {
                appointmentTypeIds: selectedAppointmentType?.id ? [selectedAppointmentType.id] : [],
                includeUnavailable: true,
                minDate: now,
            },
            {
                enabled: !!selectedAppointmentType?.id,
            }
        )
    )

    const filteredAppointmentTypes = useMemo(
        () =>
            appointmentTypes?.filter((it) => {
                const calendar = calendars?.find(
                    (calendar) => it.calendarIDs.length > 0 && it.calendarIDs[0] === calendar.id
                )

                if (!calendar) return false

                // for invoicing, show all schools on master business
                if (currentOrg === 'master' && !classRequired) {
                    return true
                }

                if (isFranchise(calendar.location as Studio)) {
                    return calendar.location === currentOrg
                } else {
                    return currentOrg === 'master'
                }
            }),
        [appointmentTypes, calendars, classRequired, currentOrg]
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
                {filteredAppointmentTypes && filteredAppointmentTypes.length !== 0 && (
                    <>
                        <Typography className={styles.heading} variant="body1">
                            Select program:
                        </Typography>
                        <FormControl className={styles.formControl} variant="outlined">
                            <Select
                                id="programs-select"
                                value={selectedAppointmentType?.id || ''}
                                onChange={handleAppointmentTypeChange}
                                disabled={filteredAppointmentTypes?.length === 0}
                            >
                                {filteredAppointmentTypes?.map((appointmentType) => (
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
                                    setNow(1704027600000) // 01/01/24
                                    setShowPreviousClasses(true)
                                    localStorage.setItem(PREV_CLASSES_CACHE_KEY, 'true')
                                } else {
                                    setNow(Date.now())
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
