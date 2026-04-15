import * as Accordion from '@radix-ui/react-accordion'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { DateTime } from 'luxon'
import { useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'

import { Alert, AlertDescription, AlertTitle } from '@ui-components/alert'
import { Button } from '@ui-components/button'
import { Skeleton } from '@ui-components/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ui-components/table'
import { useTRPC } from '@utils/trpc'

import { ChildExpandedDetails } from '../components/child-expanded-details'
import { ChildRow } from '../components/child-row'
import { useParams } from '../hooks/use-params'
import { getEnrolment } from '../utils/get-enrolment'

import type { PreschoolProgramAttendanceEnrolment } from '../utils/get-enrolment'

export function PreschoolProgramSessionAttendancePage() {
    const trpc = useTRPC()
    const params = useParams()
    const navigate = useNavigate()
    const [openItems, setOpenItems] = useState<Record<string, boolean>>({})

    const appointmentsQuery = useQuery(trpc.acuity.searchForAppointments.queryOptions(params!, { enabled: !!params }))
    const enrolmentsQuery = useQuery(
        trpc.preschoolProgram.listEnrolments.queryOptions(
            { appointmentTypeId: params?.appointmentTypeId || 0 },
            { enabled: !!params }
        )
    )

    const enrolments = useMemo(() => enrolmentsQuery.data || [], [enrolmentsQuery.data])

    const enrolmentsMap = useMemo(
        () =>
            enrolments.reduce<Record<string, PreschoolProgramAttendanceEnrolment>>(
                (acc, enrolment) => ({ ...acc, [enrolment.id]: enrolment }),
                {}
            ),
        [enrolments]
    )

    const rows = useMemo(() => {
        const appointments = appointmentsQuery.data || []
        return appointments
            .map((appointment) => ({ appointment, enrolment: getEnrolment(appointment, enrolmentsMap) }))
            .filter(
                (row): row is { appointment: (typeof appointments)[number]; enrolment: (typeof enrolments)[number] } =>
                    !!row.enrolment
            )
            .sort((a, b) => {
                const nameA = `${a.enrolment.child.firstName} ${a.enrolment.child.lastName}`
                const nameB = `${b.enrolment.child.firstName} ${b.enrolment.child.lastName}`
                return nameA.localeCompare(nameB)
            })
    }, [appointmentsQuery.data, enrolmentsMap])

    if (!params) {
        return <Navigate to="/dashboard/preschool-program" />
    }

    if (appointmentsQuery.isPending || enrolmentsQuery.isPending) {
        return (
            <div className="twp m-4">
                <Skeleton className="h-10" />
                <div className="mt-2 flex flex-col gap-2">
                    {Array.from({ length: (window.innerHeight - 240) / 64 }).map((_, idx) => (
                        <Skeleton key={idx} className="h-16" />
                    ))}
                </div>
            </div>
        )
    }

    if (appointmentsQuery.isError || enrolmentsQuery.isError) {
        return (
            <div className="twp m-4 flex h-[calc(100vh-64px)] flex-col items-center justify-center">
                <Alert variant="destructive" className="w-full max-w-md">
                    <AlertTitle className="text-center">Oops! Something went wrong.</AlertTitle>
                    <AlertDescription className="text-center">
                        We couldn't load the Preschool Program attendance data.
                    </AlertDescription>
                </Alert>
                <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                        void appointmentsQuery.refetch()
                        void enrolmentsQuery.refetch()
                    }}
                >
                    {appointmentsQuery.isFetching || enrolmentsQuery.isFetching ? (
                        <Loader2 className="animate-spin" />
                    ) : (
                        'Retry'
                    )}
                </Button>
            </div>
        )
    }

    if (rows.length === 0) {
        return (
            <div className="twp m-4 flex h-[calc(100vh-64px)] flex-col items-center justify-center">
                <Alert className="w-full max-w-md">
                    <AlertTitle className="text-center">No enrolments.</AlertTitle>
                    <AlertDescription className="text-center">
                        No one has enrolled into this session yet.
                    </AlertDescription>
                </Alert>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/dashboard/preschool-program')}>
                    <ArrowLeft className="mr-2 size-4" />
                    Go Back
                </Button>
            </div>
        )
    }

    return (
        <div className="twp m-4">
            <p className="mb-3 text-center font-gotham text-lg">
                {params.className} - {DateTime.fromISO(params.classTime).toFormat('cccc, dd MMMM, hh:mm a')}
            </p>
            <div className="m-auto max-w-7xl rounded-md border">
                <Accordion.Root type="multiple">
                    <Table className="table-auto border-collapse border-spacing-0">
                        <colgroup>
                            <col className="w-[2rem]" />
                            <col className="w-1/4" />
                            <col className="hidden w-1/4 sm:table-cell" />
                            <col className="hidden w-1/4 sm:table-cell" />
                            <col className="w-[12rem]" />
                        </colgroup>
                        <TableHeader>
                            <TableRow>
                                <TableHead />
                                <TableHead className="max-w-40 text-nowrap">Child Name</TableHead>
                                <TableHead className="hidden w-1/4 text-nowrap sm:table-cell">Age</TableHead>
                                <TableHead className="hidden w-1/4 text-nowrap text-center sm:table-cell">
                                    Tags
                                </TableHead>
                                <TableHead className="text-nowrap text-center">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.map(({ appointment, enrolment }) => {
                                const id = String(appointment.id)
                                const isOpen = openItems[id] === true

                                return (
                                    <Accordion.Item value={id} key={id} asChild>
                                        <>
                                            <Accordion.Trigger asChild>
                                                <TableRow
                                                    className="h-16 hover:cursor-pointer [&[data-state=open]>td#arrow>svg]:rotate-90 [&_td]:px-4"
                                                    onClick={() =>
                                                        setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }))
                                                    }
                                                >
                                                    <ChildRow appointment={appointment} enrolment={enrolment} />
                                                </TableRow>
                                            </Accordion.Trigger>
                                            {isOpen ? (
                                                <Accordion.Content
                                                    className="overflow-hidden text-sm transition-all data-[state=open]:animate-accordion-down"
                                                    asChild
                                                >
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="p-0">
                                                            <ChildExpandedDetails
                                                                appointment={appointment}
                                                                enrolment={enrolment}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                </Accordion.Content>
                                            ) : null}
                                        </>
                                    </Accordion.Item>
                                )
                            })}
                        </TableBody>
                    </Table>
                </Accordion.Root>
            </div>
        </div>
    )
}
