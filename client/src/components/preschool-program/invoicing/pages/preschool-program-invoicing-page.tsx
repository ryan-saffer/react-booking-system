import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { capitalise } from 'fizz-kidz'
import type { StudioOrTest } from 'fizz-kidz'

import { useOrg } from '@components/Session/use-org'
import { Alert, AlertDescription, AlertTitle } from '@ui-components/alert'
import { Button } from '@ui-components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui-components/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui-components/select'
import { Skeleton } from '@ui-components/skeleton'
import { useTRPC } from '@utils/trpc'

import { resolveCalendarStudio } from '../../booking-form/utils/resolve-calendar-studio'

const PRESCHOOL_PROGRAM_CATEGORIES: Array<'preschool-program' | 'preschool-program-test'> =
    import.meta.env.VITE_ENV === 'prod' ? ['preschool-program'] : ['preschool-program-test']

const isProdEnv = import.meta.env.VITE_ENV === 'prod'

export function PreschoolProgramInvoicingPage() {
    const { currentOrg } = useOrg()

    return <PreschoolProgramInvoicingPageContent key={currentOrg ?? 'master'} currentOrg={currentOrg} />
}

function PreschoolProgramInvoicingPageContent({ currentOrg }: { currentOrg: ReturnType<typeof useOrg>['currentOrg'] }) {
    const trpc = useTRPC()
    const navigate = useNavigate()

    const showStudioSelector = currentOrg === 'master'
    const [selectedStudio, setSelectedStudio] = useState<StudioOrTest | null>(
        currentOrg === 'master' ? null : isProdEnv ? currentOrg : 'test'
    )
    const [selectedAppointmentTypeId, setSelectedAppointmentTypeId] = useState<string | null>(null)

    const appointmentTypesQuery = useQuery(
        trpc.acuity.getAppointmentTypes.queryOptions({
            category: PRESCHOOL_PROGRAM_CATEGORIES,
        })
    )

    const classesQuery = useQuery(
        trpc.acuity.classAvailability.queryOptions(
            {
                appointmentTypeIds: appointmentTypesQuery.data?.map((program) => program.id) || [],
                includeUnavailable: true,
            },
            { enabled: !!appointmentTypesQuery.data }
        )
    )

    console.log({ appointmentTypes: appointmentTypesQuery.data, classes: classesQuery.data })

    const availableStudios = useMemo(() => {
        if (!classesQuery.data) return []

        return Array.from(
            new Set(
                classesQuery.data
                    .map((klass) => resolveCalendarStudio(klass.calendarID))
                    .filter((studio): studio is StudioOrTest => !!studio)
            )
        ).sort((a, b) => (a < b ? -1 : 1))
    }, [classesQuery.data])

    const filteredAppointmentTypes = useMemo(() => {
        if (!appointmentTypesQuery.data || !classesQuery.data || !selectedStudio) return []

        return appointmentTypesQuery.data.filter((program) =>
            classesQuery.data.some(
                (klass) =>
                    klass.appointmentTypeID === program.id && resolveCalendarStudio(klass.calendarID) === selectedStudio
            )
        )
    }, [appointmentTypesQuery.data, classesQuery.data, selectedStudio])

    const selectedProgram = filteredAppointmentTypes.find(
        (program) => program.id.toString() === selectedAppointmentTypeId
    )

    function handleOpenProgram() {
        if (!selectedProgram) return

        navigate(
            `program?appointmentTypeId=${selectedProgram.id}&programName=${encodeURIComponent(selectedProgram.name)}`
        )
    }

    if (appointmentTypesQuery.isPending || classesQuery.isPending) {
        return (
            <main className="twp flex justify-center bg-slate-100 px-4 py-6 dashboard-full-screen">
                <div className="w-full max-w-4xl space-y-4">
                    <div>
                        <h1 className="lilita text-2xl">Preschool Program Invoicing</h1>
                        <p className="text-sm text-slate-600">
                            Choose a studio and program to review invoice status and send invoices.
                        </p>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl">Select Program</CardTitle>
                            <CardDescription>
                                Preschool Program invoices are managed at the program level, not per session.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="mt-3 space-y-6">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <div className="flex justify-end">
                                <Skeleton className="h-10 w-36" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        )
    }

    if (appointmentTypesQuery.isError || classesQuery.isError) {
        return (
            <main className="flex items-center justify-center bg-slate-100 px-4 dashboard-full-screen">
                <Alert variant="destructive" className="max-w-md">
                    <AlertTitle>Unable to load Preschool Program invoicing</AlertTitle>
                    <AlertDescription>There was a problem loading the available studios and programs.</AlertDescription>
                </Alert>
            </main>
        )
    }

    return (
        <main className="twp flex justify-center bg-slate-100 px-4 py-6 dashboard-full-screen">
            <div className="w-full max-w-4xl space-y-4">
                <div>
                    <h1 className="lilita text-2xl">Preschool Program Invoicing</h1>
                    <p className="text-sm text-slate-600">
                        Choose a studio and program to review invoice status and send invoices.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Select Program</CardTitle>
                        <CardDescription>
                            Preschool Program invoices are managed at the program level, not per session.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {showStudioSelector ? (
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Studio</p>
                                <Select
                                    value={selectedStudio || undefined}
                                    onValueChange={(value) => {
                                        setSelectedStudio(value as StudioOrTest)
                                        setSelectedAppointmentTypeId(null)
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a studio" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableStudios.map((studio) => (
                                            <SelectItem key={studio} value={studio}>
                                                {capitalise(studio)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        ) : null}

                        <div className="space-y-2">
                            <p className="text-sm font-medium">Program</p>
                            <Select
                                value={selectedAppointmentTypeId || undefined}
                                onValueChange={setSelectedAppointmentTypeId}
                                disabled={!selectedStudio || filteredAppointmentTypes.length === 0}
                            >
                                <SelectTrigger>
                                    <SelectValue
                                        placeholder={
                                            selectedStudio && filteredAppointmentTypes.length === 0
                                                ? 'No programs available'
                                                : 'Select a program'
                                        }
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {filteredAppointmentTypes.map((program) => (
                                        <SelectItem key={program.id} value={program.id.toString()}>
                                            {program.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex justify-end">
                            <Button onClick={handleOpenProgram} disabled={!selectedProgram}>
                                Open Invoicing
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}
