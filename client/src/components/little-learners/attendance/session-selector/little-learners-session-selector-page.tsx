import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { DateTime } from 'luxon'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { capitalise } from 'fizz-kidz'
import type { StudioOrTest } from 'fizz-kidz'

import { useOrg } from '@components/Session/use-org'
import { Alert, AlertDescription, AlertTitle } from '@ui-components/alert'
import { Button } from '@ui-components/button'
import { Checkbox } from '@ui-components/checkbox'
import { Label } from '@ui-components/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui-components/select'
import { Skeleton } from '@ui-components/skeleton'
import { useTRPC } from '@utils/trpc'

import { resolveCalendarStudio } from '../../booking-form/utils/resolve-calendar-studio'

import type { ReactNode } from 'react'

const LITTLE_LEARNERS_CATEGORIES: Array<'little-learners' | 'little-learners-test'> =
    import.meta.env.VITE_ENV === 'prod' ? ['little-learners'] : ['little-learners-test']

function Root({ children }: { children: ReactNode }) {
    return (
        <div className="twp mx-4 my-4 flex max-w-3xl flex-col gap-4 rounded-md border p-8 pt-4 md:mx-auto">
            <p className="mb-2 font-lilita text-xl tracking-wide">Little Learners Program Selection</p>
            {children}
        </div>
    )
}

export function LittleLearnersSessionSelectorPage() {
    const { currentOrg } = useOrg()

    return <LittleLearnersSessionSelectorPageContent key={currentOrg ?? 'master'} currentOrg={currentOrg} />
}

function LittleLearnersSessionSelectorPageContent({
    currentOrg,
}: {
    currentOrg: ReturnType<typeof useOrg>['currentOrg']
}) {
    const trpc = useTRPC()
    const navigate = useNavigate()

    const showStudioSelector = currentOrg === 'master'

    const [selectedStudio, setSelectedStudio] = useState<StudioOrTest | null>(
        currentOrg === 'master' ? null : currentOrg
    )
    const [selectedAppointmentType, setSelectedAppointmentType] = useState<string | null>(null)
    const [selectedClass, setSelectedClass] = useState<string | null>(null)
    const [showPreviousSessions, setShowPreviousSessions] = useState(false)
    const [now] = useState(() => DateTime.now())

    const {
        data: appointmentTypes,
        isPending: isLoadingAppointmentTypes,
        isSuccess: isSuccessAppointmentTypes,
        isError: isErrorAppointmentTypes,
        refetch,
        isFetching,
    } = useQuery(
        trpc.acuity.getAppointmentTypes.queryOptions({
            category: LITTLE_LEARNERS_CATEGORIES,
            availableToBook: true,
        })
    )

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

    const availableStudios = useMemo(() => {
        if (!classes) return []

        return Array.from(
            new Set(
                classes
                    .map((klass) => resolveCalendarStudio(klass.calendarID))
                    .filter((studio): studio is StudioOrTest => !!studio)
            )
        ).sort((a, b) => (a < b ? -1 : 1))
    }, [classes])

    const filteredAppointmentTypes = useMemo(
        () =>
            appointmentTypes?.filter((program) => {
                if (!selectedStudio || !classes) return false
                return classes.some(
                    (klass) =>
                        klass.appointmentTypeID === program.id &&
                        resolveCalendarStudio(klass.calendarID) === selectedStudio
                )
            }) || [],
        [appointmentTypes, classes, selectedStudio]
    )

    const filteredClasses = useMemo(
        () =>
            classes?.filter((klass) => {
                const isProgram = klass.appointmentTypeID.toString() === selectedAppointmentType
                if (!isProgram) return false

                if (showPreviousSessions) return true

                const classDate = DateTime.fromISO(klass.time, { setZone: true })
                const todayInClassZone = now.setZone(classDate.zoneName).startOf('day')

                return classDate.startOf('day') >= todayInClassZone
            }) || [],
        [classes, selectedAppointmentType, showPreviousSessions, now]
    )

    function formatDate(time: string) {
        return DateTime.fromISO(time, { setZone: true }).toFormat('cccc d LLLL, h:mm a')
    }

    function handleSubmit() {
        const klass = classes?.find((it) => it.id === parseInt(selectedClass || '0'))
        const appointmentType = appointmentTypes?.find((it) => it.id === parseInt(selectedAppointmentType || '0'))
        if (!klass || !appointmentType) return

        navigate(
            `${appointmentType.id}?classId=${klass.id}&calendarId=${klass.calendarID}&classTime=${encodeURIComponent(klass.time)}&className=${encodeURIComponent(appointmentType.name)}`
        )
    }

    if (isPending) {
        return (
            <Root>
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
                <Button disabled>Select Session</Button>
            </Root>
        )
    }

    if (isError) {
        return (
            <div className="twp m-4 flex h-[calc(100vh-64px)] flex-col items-center justify-center">
                <Alert variant="destructive" className="w-full max-w-md">
                    <AlertTitle className="text-center">Oops! Something went wrong.</AlertTitle>
                    <AlertDescription className="text-center">
                        We couldn't load the Little Learners sessions.
                    </AlertDescription>
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
                {showStudioSelector && (
                    <Select
                        onValueChange={(value) => {
                            setSelectedStudio(value as StudioOrTest)
                            setSelectedAppointmentType(null)
                            setSelectedClass(null)
                        }}
                        value={selectedStudio || ''}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select Studio" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableStudios.map((studio) => (
                                <SelectItem key={studio} value={studio}>
                                    {capitalise(studio)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}

                <Select
                    onValueChange={(id) => {
                        setSelectedAppointmentType(id)
                        setSelectedClass(null)
                    }}
                    value={selectedAppointmentType || ''}
                    disabled={!selectedStudio || filteredAppointmentTypes.length === 0}
                >
                    <SelectTrigger>
                        <SelectValue
                            placeholder={
                                filteredAppointmentTypes.length === 0 && selectedStudio
                                    ? 'No available programs'
                                    : 'Select Program'
                            }
                        />
                    </SelectTrigger>
                    <SelectContent>
                        {filteredAppointmentTypes.map((appointmentType) => (
                            <SelectItem key={appointmentType.id} value={appointmentType.id.toString()}>
                                {appointmentType.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    onValueChange={setSelectedClass}
                    value={selectedClass || ''}
                    disabled={!selectedAppointmentType || filteredClasses.length === 0}
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
                            if (!checked && selectedClass) {
                                const klass = classes?.find((it) => it.id === parseInt(selectedClass))
                                if (klass) {
                                    const classDate = DateTime.fromISO(klass.time, { setZone: true })
                                    const todayInClassZone = now.setZone(classDate.zoneName).startOf('day')
                                    if (classDate.startOf('day') < todayInClassZone) setSelectedClass(null)
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
