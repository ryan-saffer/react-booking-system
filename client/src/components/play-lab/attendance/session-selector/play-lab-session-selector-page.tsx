import { AcuityConstants, ObjectEntries, addOrdinalSuffix, capitalise } from 'fizz-kidz'
import { Loader2 } from 'lucide-react'
import { DateTime } from 'luxon'
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Alert, AlertDescription, AlertTitle } from '@ui-components/alert'
import { Button } from '@ui-components/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui-components/select'
import { Skeleton } from '@ui-components/skeleton'
import { trpc } from '@utils/trpc'

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
    const navigate = useNavigate()

    const [selectedCalendar, setSelectedCalendar] = useState<string | null>(null)
    const [selectedAppointmentType, setSelectedAppointmentType] = useState<string | null>(null)
    const [selectedClass, setSelectedClass] = useState<string | null>(null)

    const {
        data: appointmentTypes,
        isLoading: isLoadingAppointmentTypes,
        isSuccess: isSuccessAppointmentTypes,
        isError: isErrorAppointmentTypes,
        refetch,
        isFetching,
    } = trpc.acuity.getAppointmentTypes.useQuery({
        category: import.meta.env.VITE_ENV === 'prod' ? ['play-lab'] : ['play-lab-test'],
    })

    // can only fetch the classes once the appointment types have been returned
    const {
        data: classes,
        isSuccess: isSuccessClasses,
        isLoading: isLoadingClasses,
        isError: isErrorClasses,
    } = trpc.acuity.classAvailability.useQuery(
        {
            appointmentTypeIds: isSuccessAppointmentTypes ? appointmentTypes.map((it) => it.id) : [],
            includeUnavailable: true,
        },
        { enabled: isSuccessAppointmentTypes }
    )

    const isSuccess = isSuccessAppointmentTypes && isSuccessClasses
    const isLoading = isLoadingAppointmentTypes || isLoadingClasses
    const isError = isErrorAppointmentTypes || isErrorClasses

    const filteredClasses = useMemo(
        () => classes?.filter((it) => it.appointmentTypeID.toString() === selectedAppointmentType) || [],
        [classes, selectedAppointmentType]
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
        navigate(
            `${selectedAppointmentType}?classId=${selectedClass}&calendarId=${selectedCalendar}&classTime=${encodeURIComponent(klass!.time)}&className=${encodeURIComponent(klass!.name)}`
        )
    }

    if (isLoading)
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
                <Select
                    onValueChange={(id) => {
                        setSelectedCalendar(id)
                        setSelectedAppointmentType(null)
                        setSelectedClass(null)
                    }}
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

                <Select
                    onValueChange={(id) => {
                        setSelectedAppointmentType(id)
                        setSelectedClass(null)
                    }}
                    disabled={!selectedCalendar}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select Program" />
                    </SelectTrigger>
                    <SelectContent>
                        {appointmentTypes.map((appointmentType) => {
                            const { day, time } = JSON.parse(appointmentType.description)
                            return (
                                <SelectItem
                                    key={appointmentType.id}
                                    value={appointmentType.id.toString()}
                                    className="overflow-visible text-wrap"
                                >
                                    {appointmentType.name} - {day} - {time}
                                </SelectItem>
                            )
                        })}
                    </SelectContent>
                </Select>

                <Select onValueChange={setSelectedClass} disabled={!selectedCalendar || !selectedAppointmentType}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Session" />
                    </SelectTrigger>
                    <SelectContent>
                        {filteredClasses.map((klass) => (
                            <SelectItem key={klass.id} value={klass.id.toString()}>
                                {formatDate(klass.time)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button disabled={!selectedClass} onClick={handleSubmit}>
                    Select Session
                </Button>
            </Root>
        )
    }
}
