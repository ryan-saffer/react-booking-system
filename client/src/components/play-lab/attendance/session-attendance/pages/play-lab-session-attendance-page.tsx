import * as Accordion from '@radix-ui/react-accordion'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { DateTime } from 'luxon'
import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'

import { AcuityConstants, AcuityUtilities } from 'fizz-kidz'

import { Alert, AlertDescription, AlertTitle } from '@ui-components/alert'
import { Button } from '@ui-components/button'
import { Skeleton } from '@ui-components/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ui-components/table'
import { useTRPC } from '@utils/trpc'

import { ChildExpandedDetails } from '../components/child-expanded-details'
import { ChildRow } from '../components/child-row'
import { useParams } from '../hooks/use-params'


export function PlayLabSessionAttendancePage() {
    const trpc = useTRPC()
    const params = useParams()

    const [openItems, setOpenItems] = useState<Record<string, boolean>>({})
    const navigate = useNavigate()

    const {
        data: appointments,
        isSuccess,
        isPending,
        isFetching,
        isError,
        error,
        refetch,
    } = useQuery(trpc.acuity.searchForAppointments.queryOptions(params!, { enabled: !!params }))

    if (!params) {
        return <Navigate to="/dashboard/play-lab" />
    }

    if (isPending) {
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

    if (isError) {
        return (
            <div className="twp m-4 flex h-[calc(100vh-64px)] flex-col items-center justify-center">
                <Alert variant="destructive" className="w-full max-w-md">
                    <AlertTitle className="text-center">Oops! Something went wrong.</AlertTitle>
                    <AlertDescription className="text-center">
                        We couldn't load attendance data.
                        <span className="font-mono text-xs">{error?.message}</span>
                    </AlertDescription>
                </Alert>
                <Button variant="outline" className="mt-4" onClick={() => refetch()}>
                    {isFetching ? <Loader2 className="animate-spin" /> : 'Retry'}
                </Button>
            </div>
        )
    }

    if (isSuccess && appointments.length === 0) {
        return (
            <div className="twp m-4 flex h-[calc(100vh-64px)] flex-col items-center justify-center">
                <Alert variant="default" className="w-full max-w-md">
                    <AlertTitle className="text-center">No enrolments.</AlertTitle>
                    <AlertDescription className="text-center">
                        No one has enrolled into this session yet.
                    </AlertDescription>
                </Alert>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/dashboard/play-lab')}>
                    <ArrowLeft className="mr-2 size-4" />
                    Go Back
                </Button>
            </div>
        )
    }

    if (isSuccess && params) {
        return (
            <div className="twp m-4">
                <p className="mb-2 text-center font-gotham text-lg">
                    {params.className} - {DateTime.fromISO(params.classTime).toFormat('cccc, dd MMMM, hh:mm a')}
                </p>
                <div className="rounded-md border">
                    <Accordion.Root type="multiple">
                        <Table className="table-auto border-collapse border-spacing-0">
                            <colgroup>
                                {/* 1) Icon column – fixed 2rem */}
                                <col className="w-[2rem]" />

                                <col className="w-1/4" />
                                <col className="hidden w-1/4 sm:table-cell" />
                                <col className="hidden w-1/4 sm:table-cell" />

                                {/* 5) Action column – fixed (say 12rem) */}
                                <col className="w-[12rem]" />
                            </colgroup>
                            <TableHeader>
                                <TableRow>
                                    <TableHead />
                                    <TableHead className="max-w-40 text-nowrap">Child Name</TableHead>
                                    <TableHead className="hidden w-1/4 text-nowrap sm:table-cell">Child Age</TableHead>
                                    <TableHead className="hidden w-1/4 text-nowrap text-center sm:table-cell">
                                        Tags
                                    </TableHead>
                                    <TableHead className="text-nowrap text-center">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {appointments
                                    .sort((a, b) => {
                                        const childA = AcuityUtilities.retrieveFormAndField(
                                            a,
                                            AcuityConstants.Forms.CHILDREN_DETAILS,
                                            AcuityConstants.FormFields.CHILDREN_NAMES
                                        )
                                        const childB = AcuityUtilities.retrieveFormAndField(
                                            b,
                                            AcuityConstants.Forms.CHILDREN_DETAILS,
                                            AcuityConstants.FormFields.CHILDREN_NAMES
                                        )
                                        return childA < childB ? -1 : 1
                                    })
                                    .map((appointment) => {
                                        const id = String(appointment.id)
                                        const isOpen = openItems[id] === true
                                        return (
                                            <Accordion.Item value={`${appointment.id}`} key={id} asChild>
                                                <>
                                                    <Accordion.Trigger asChild>
                                                        <TableRow
                                                            className="h-16 hover:cursor-pointer [&[data-state=open]>td#arrow>svg]:rotate-90 [&_td]:px-4"
                                                            onClick={() =>
                                                                setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }))
                                                            }
                                                        >
                                                            <ChildRow appointment={appointment} />
                                                        </TableRow>
                                                    </Accordion.Trigger>
                                                    {isOpen && (
                                                        <Accordion.Content
                                                            className="overflow-hidden text-sm transition-all data-[state=open]:animate-accordion-down"
                                                            asChild
                                                        >
                                                            <TableRow>
                                                                <TableCell colSpan={5} className="p-0">
                                                                    <ChildExpandedDetails appointment={appointment} />
                                                                </TableCell>
                                                            </TableRow>
                                                        </Accordion.Content>
                                                    )}
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
}
