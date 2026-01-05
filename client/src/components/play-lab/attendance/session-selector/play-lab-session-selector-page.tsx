import { AcuityConstants, ObjectEntries, addOrdinalSuffix, capitalise } from 'fizz-kidz'
import { Loader2 } from 'lucide-react'
import { DateTime } from 'luxon'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useOrg } from '@components/Session/use-org'
import { Alert, AlertDescription, AlertTitle } from '@ui-components/alert'
import { Button } from '@ui-components/button'
import { Checkbox } from '@ui-components/checkbox'
import { Label } from '@ui-components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui-components/select'
import { Skeleton } from '@ui-components/skeleton'
import { useTRPC } from '@utils/trpc'

import { useQuery } from '@tanstack/react-query'

function Root({ children }: { children: ReactNode }) {
    return (
        <div className="twp mx-4 my-4 flex max-w-3xl flex-col gap-4 rounded-md border p-8 pt-4 md:mx-auto">
            <p className="mb-2 font-lilita text-xl tracking-wide">Play Lab Program Selection</p>
            {children}
        </div>
    )
}

/**
 * A page for selecting which Play Lab session you would like to view attendance for.
 *
 * Selects the:
 *   1. Studio
 *   2. Program
 *   3. Session
 *
 * Whenever changing a selection, it resets all those below.
 *
 * Confirming will navigate to '/play-lab/{appointmentTypeId}' and provide classId and classTime as search params.
 */
export function PlayLabSessionSelectorPage() {
    const trpc = useTRPC()
    const navigate = useNavigate()
    const { currentOrg } = useOrg()

    const showLocationSelector = currentOrg === 'master'

    const [selectedCalendar, setSelectedCalendar] = useState<string | null>(
        currentOrg === 'master' ? null : `${AcuityConstants.StoreCalendars[currentOrg!]}`
    )
    const [selectedAppointmentType, setSelectedAppointmentType] = useState<string | null>(null)
    const [selectedClass, setSelectedClass] = useState<string | null>(null)
    const [showPreviousSessions, setShowPreviousSessions] = useState(false)

    useEffect(() => {
        setSelectedCalendar(currentOrg === 'master' ? null : `${AcuityConstants.StoreCalendars[currentOrg!]}`)
    }, [currentOrg])

    const {
        data: appointmentTypes,
        isPending: isLoadingAppointmentTypes,
        isSuccess: isSuccessAppointmentTypes,
        isError: isErrorAppointmentTypes,
        refetch,
        isFetching,
    } = useQuery(
        trpc.acuity.getAppointmentTypes.queryOptions({
            category: import.meta.env.VITE_ENV === 'prod' ? ['play-lab'] : ['play-lab-test'],
        })
    )

    // can only fetch the classes once the appointment types have been returned
    const {
        data: classes,
        isSuccess: isSuccessClasses,
        isPending: isLoadingClasses,
        isError: isErrorClasses,
    } = useQuery(
        trpc.acuity.classAvailability.queryOptions(
            {
                appointmentTypeIds: isSuccessAppointmentTypes ? appointmentTypes.map((it) => it.id) : [],
                includeUnavailable: true,
            },
            { enabled: isSuccessAppointmentTypes }
        )
    )

    const isSuccess = isSuccessAppointmentTypes && isSuccessClasses
    const isPending = isLoadingAppointmentTypes || isLoadingClasses
    const isError = isErrorAppointmentTypes || isErrorClasses

    const now = useRef(DateTime.now())

    const filteredAppointmentTypes = useMemo(
        () => appointmentTypes?.filter((it) => it.calendarIDs.includes(parseInt(selectedCalendar || ''))) || [],
        [appointmentTypes, selectedCalendar]
    )

    const filteredClasses = useMemo(
        () =>
            classes?.filter((it) => {
                const isCalendarAndSession =
                    it.appointmentTypeID.toString() === selectedAppointmentType &&
                    it.calendarID === parseInt(selectedCalendar || '0')

                if (!isCalendarAndSession) return false

                if (showPreviousSessions) return true

                const classDate = DateTime.fromISO(it.time, { setZone: true })
                const todayInClassZone = now.current.setZone(classDate.zoneName).startOf('day')

                return classDate.startOf('day') >= todayInClassZone
            }) || [],
        [classes, selectedAppointmentType, selectedCalendar, showPreviousSessions]
    )

    const filteredStudios = useMemo(
        () =>
            ObjectEntries(AcuityConstants.StoreCalendars).filter(
                ([location]) => !!classes?.find((it) => it.calendarID === AcuityConstants.StoreCalendars[location])
            ),
        [classes]
    )

    function formatDate(time: string) {
        const dateTime = DateTime.fromISO(time, { setZone: true })
        return `${addOrdinalSuffix(dateTime.get('day').toString())} of ${dateTime.toFormat('LLLL, yyyy')}`
    }

    function handleSubmit() {
        const klass = classes?.find((it) => it.id === parseInt(selectedClass!))
        if (!klass) return
        const { name } = JSON.parse(klass.description)
        navigate(
            `${selectedAppointmentType}?classId=${selectedClass}&calendarId=${selectedCalendar}&classTime=${encodeURIComponent(klass!.time)}&className=${encodeURIComponent(name)}`
        )
    }

    if (isPending)
        return (
            <Root>
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
                <Button disabled>Select Session</Button>
            </Root>
        )

    if (isError) {
        return (
            <div className="twp m-4 flex h-[calc(100vh-64px)] flex-col items-center justify-center">
                <Alert variant="destructive" className="w-full max-w-md">
                    <AlertTitle className="text-center">Oops! Something went wrong.</AlertTitle>
                    <AlertDescription className="text-center">We couldn't load the play lab sessions.</AlertDescription>
                </Alert>
                <Button variant="outline" className="mt-4" onClick={() => refetch()}>
                    {isFetching ? <Loader2 className="animate-spin" /> : 'Retry'}
                </Button>
            </div>
        )
    }

    if (isSuccess) {
        return (
            <Root>
                {showLocationSelector && (
                    <Select
                        onValueChange={(id) => {
                            console.log(id)
                            setSelectedCalendar(id)
                            setSelectedAppointmentType(null)
                            setSelectedClass(null)
                        }}
                        value={selectedCalendar || ''}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select Studio" />
                        </SelectTrigger>
                        <SelectContent>
                            {import.meta.env.VITE_ENV === 'prod' ? (
                                filteredStudios.map(([store, calendarId]) => (
                                    <SelectItem key={calendarId} value={calendarId.toString()}>
                                        {capitalise(store)}
                                    </SelectItem>
                                ))
                            ) : (
                                <SelectItem key="test" value={AcuityConstants.TestCalendarId.toString()}>
                                    Test
                                </SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                )}

                <Select
                    onValueChange={(id) => {
                        setSelectedAppointmentType(id)
                        setSelectedClass(null)
                    }}
                    disabled={!selectedCalendar || filteredAppointmentTypes.length === 0}
                >
                    <SelectTrigger>
                        <SelectValue
                            placeholder={
                                filteredAppointmentTypes.length === 0 && selectedCalendar
                                    ? 'No available programs'
                                    : 'Select Program'
                            }
                        />
                    </SelectTrigger>
                    <SelectContent>
                        {filteredAppointmentTypes.map((appointmentType) => {
                            const { time } = JSON.parse(appointmentType.description)
                            return (
                                <SelectItem
                                    key={appointmentType.id}
                                    value={appointmentType.id.toString()}
                                    className="overflow-visible text-wrap"
                                >
                                    {appointmentType.name} - {time}
                                </SelectItem>
                            )
                        })}
                    </SelectContent>
                </Select>

                <Select
                    onValueChange={setSelectedClass}
                    disabled={!selectedCalendar || !selectedAppointmentType || filteredClasses.length === 0}
                >
                    <SelectTrigger>
                        <SelectValue
                            placeholder={
                                filteredClasses.length === 0 && selectedAppointmentType
                                    ? 'No upcoming sessions'
                                    : 'Select Session'
                            }
                        />
                    </SelectTrigger>
                    <SelectContent>
                        {filteredClasses.map((klass) => (
                            <SelectItem key={klass.id} value={klass.id.toString()}>
                                {formatDate(klass.time)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <div className="my-2 flex cursor-pointer items-center justify-end gap-4">
                    <Checkbox
                        id="showPreviousSessions"
                        onCheckedChange={(checked) => {
                            setShowPreviousSessions(!!checked)
                            // if disabling showing previous sessions and a previous session is selected, reset
                            if (!checked && selectedClass) {
                                const klass = classes?.find((it) => it.id === parseInt(selectedClass))
                                if (klass) {
                                    const classDate = DateTime.fromISO(klass.time, { setZone: true })
                                    const todayInClassZone = now.current.setZone(classDate.zoneName).startOf('day')
                                    const isPast = classDate.startOf('day') < todayInClassZone
                                    if (isPast) setSelectedClass(null)
                                }
                            }
                        }}
                        checked={showPreviousSessions}
                    />
                    <Label htmlFor="showPreviousSessions" className="cursor-pointer">
                        Show previous sessions
                    </Label>
                </div>

                <Button disabled={!selectedClass} onClick={handleSubmit}>
                    Select Session
                </Button>
            </Root>
        )
    }
}
