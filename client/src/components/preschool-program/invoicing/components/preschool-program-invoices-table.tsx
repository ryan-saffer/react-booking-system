import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { differenceInYears } from 'date-fns'
import { ArrowLeft, ChevronDown, ExternalLink, Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import type { InvoiceStatusMap, PreschoolProgramEnrolment } from 'fizz-kidz'

import { Alert, AlertDescription, AlertTitle } from '@ui-components/alert'
import { Button } from '@ui-components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui-components/card'
import { Checkbox } from '@ui-components/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@ui-components/dropdown-menu'
import { Skeleton } from '@ui-components/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ui-components/table'
import { useTRPC } from '@utils/trpc'

import { InvoiceStatusBadge } from './invoice-status-badge'
import { SendInvoicesDialog } from './send-invoices-dialog'
import { UnenrollEnrolmentsDialog } from './unenroll-enrolments-dialog'

type PreschoolProgramClientEnrolment = Omit<PreschoolProgramEnrolment, 'createdAt' | 'updatedAt'> & {
    createdAt: string | Date
    updatedAt: string | Date
}

export function PreschoolProgramInvoicesTable() {
    const trpc = useTRPC()
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isUnenrollDialogOpen, setIsUnenrollDialogOpen] = useState(false)

    const appointmentTypeId = parseInt(searchParams.get('appointmentTypeId') || '')
    const programName = decodeURIComponent(searchParams.get('programName') || '')

    const enrolmentsQuery = useQuery(
        trpc.preschoolProgram.listEnrolments.queryOptions({
            appointmentTypeId,
        })
    )

    const enrolments = useMemo(
        () =>
            ((enrolmentsQuery.data || []) as PreschoolProgramClientEnrolment[]).sort((a, b) =>
                `${a.parent.firstName} ${a.parent.lastName}`.localeCompare(`${b.parent.firstName} ${b.parent.lastName}`)
            ),
        [enrolmentsQuery.data]
    )

    const invoiceStatusesQuery = useQuery(
        trpc.preschoolProgram.retrieveInvoiceStatuses.queryOptions(
            { enrolmentIds: enrolments.map((enrolment) => enrolment.id) },
            { enabled: enrolments.length > 0, initialData: {} as InvoiceStatusMap }
        )
    )

    const sendInvoicesMutation = useMutation(
        trpc.preschoolProgram.sendInvoices.mutationOptions({
            onSuccess: (result) => {
                queryClient.setQueryData(
                    trpc.preschoolProgram.retrieveInvoiceStatuses.queryKey({
                        enrolmentIds: enrolments.map((enrolment) => enrolment.id),
                    }),
                    (existing: InvoiceStatusMap | undefined) => ({ ...existing, ...result })
                )
            },
        })
    )
    const unenrollMutation = useMutation(
        trpc.preschoolProgram.unenrollFromPreschoolProgram.mutationOptions({
            onSuccess: (_, variables) => {
                queryClient.setQueryData(
                    trpc.preschoolProgram.listEnrolments.queryKey({ appointmentTypeId }),
                    (existing) => existing?.filter((enrolment) => !variables.enrolmentIds.includes(enrolment.id))
                )
                queryClient.setQueryData(
                    trpc.preschoolProgram.retrieveInvoiceStatuses.queryKey({
                        enrolmentIds: enrolments.map((enrolment) => enrolment.id),
                    }),
                    (existing: InvoiceStatusMap | undefined) => {
                        if (!existing) return existing

                        const next = { ...existing }
                        for (const id of variables.enrolmentIds) {
                            delete next[id]
                        }
                        return next
                    }
                )
            },
        })
    )

    const actionsLoading = sendInvoicesMutation.isPending || unenrollMutation.isPending

    const allSelected = enrolments.length > 0 && selectedIds.length === enrolments.length

    function toggleAllRows(checked: boolean) {
        setSelectedIds(checked ? enrolments.map((enrolment) => enrolment.id) : [])
    }

    function toggleRow(id: string, checked: boolean) {
        setSelectedIds((current) => (checked ? [...current, id] : current.filter((item) => item !== id)))
    }

    function toggleRowSelection(id: string) {
        setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
    }

    async function handleSendInvoices(numberOfWeeks: number) {
        const includesPaidInvoice = selectedIds.some((id) => invoiceStatusesQuery.data[id]?.status === 'PAID')

        if (includesPaidInvoice) {
            toast.error('One or more selected enrolments already have a paid invoice.')
            return
        }

        try {
            await sendInvoicesMutation.mutateAsync(selectedIds.map((id) => ({ id, numberOfWeeks })))
            setSelectedIds([])
            toast.success('Invoices sent.')
        } catch (error) {
            const message = error instanceof Error ? error.message : 'There was an error sending invoices.'
            toast.error(message)
        }
    }

    async function handleUnenroll() {
        try {
            await unenrollMutation.mutateAsync({ enrolmentIds: selectedIds })
            setSelectedIds([])
            setIsUnenrollDialogOpen(false)
            toast.success('Enrolments removed from the term.')
        } catch (error) {
            const message = error instanceof Error ? error.message : 'There was an error unenrolling from the term.'
            toast.error(message)
        }
    }

    if (!appointmentTypeId || !programName) {
        return <Navigate to="/dashboard/preschool-program-invoicing" />
    }

    if (enrolmentsQuery.isPending) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="lilita text-2xl">Preschool Program Invoicing</h1>
                        <p className="text-sm text-slate-600">{programName}</p>
                    </div>
                    <Button variant="outline" onClick={() => navigate('/dashboard/preschool-program-invoicing')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                </div>

                <Card>
                    <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="text-xl">Invoice Status</CardTitle>
                            <CardDescription>
                                Send invoices manually and keep track of whether they are paid or still outstanding.
                            </CardDescription>
                        </div>
                        <Button disabled>Loading</Button>
                    </CardHeader>
                    <CardContent>
                        <div className="flex min-h-40 items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (enrolmentsQuery.isError) {
        return (
            <Alert variant="destructive">
                <AlertTitle>Unable to load enrolments</AlertTitle>
                <AlertDescription>
                    There was a problem loading the Preschool Program enrolments for this program.
                </AlertDescription>
            </Alert>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="lilita text-2xl">Preschool Program Invoicing</h1>
                    <p className="text-sm text-slate-600">{programName}</p>
                </div>
                <Button variant="outline" onClick={() => navigate('/dashboard/preschool-program-invoicing')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
            </div>

            <Card>
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="text-xl">Invoice Status</CardTitle>
                        <CardDescription>
                            Send invoices manually and keep track of whether they are paid or still outstanding.
                        </CardDescription>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button disabled={selectedIds.length === 0 || actionsLoading}>
                                {actionsLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Actions
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>Send Invoices</DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={() => setIsUnenrollDialogOpen(true)}
                            >
                                Unenrol From Term
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardHeader>
                <CardContent>
                    {enrolments.length === 0 ? (
                        <Alert>
                            <AlertTitle>No enrolments found</AlertTitle>
                            <AlertDescription>
                                No active Preschool Program enrolments were found for this program.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">
                                        <Checkbox
                                            checked={allSelected}
                                            disabled={actionsLoading}
                                            onCheckedChange={(checked) => toggleAllRows(checked === true)}
                                        />
                                    </TableHead>
                                    <TableHead>Parent</TableHead>
                                    <TableHead>Child</TableHead>
                                    <TableHead>Age</TableHead>
                                    <TableHead>Weeks</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Links</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {enrolments.map((enrolment) => {
                                    const status = invoiceStatusesQuery.data[enrolment.id]
                                    const age = differenceInYears(new Date(), new Date(enrolment.child.dob))

                                    const hasInvoiceLinks =
                                        status?.status === 'PAID' ||
                                        status?.status === 'UNPAID' ||
                                        status?.status === 'VOID'

                                    return (
                                        <TableRow
                                            key={enrolment.id}
                                            className={actionsLoading ? 'cursor-not-allowed' : 'cursor-pointer'}
                                            onClick={() => {
                                                if (actionsLoading) return
                                                toggleRowSelection(enrolment.id)
                                            }}
                                        >
                                            <TableCell onClick={(event) => event.stopPropagation()}>
                                                <Checkbox
                                                    checked={selectedIds.includes(enrolment.id)}
                                                    disabled={actionsLoading}
                                                    onCheckedChange={(checked) =>
                                                        toggleRow(enrolment.id, checked === true)
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">
                                                    {enrolment.parent.firstName} {enrolment.parent.lastName}
                                                </div>
                                                <div className="text-sm text-slate-500">{enrolment.parent.email}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">
                                                    {enrolment.child.firstName} {enrolment.child.lastName}
                                                </div>
                                                {enrolment.child.allergies ? (
                                                    <div className="text-sm text-red-600">Allergies noted</div>
                                                ) : null}
                                            </TableCell>
                                            <TableCell>{age}</TableCell>
                                            <TableCell>{enrolment.appointments.length}</TableCell>
                                            <TableCell>
                                                {invoiceStatusesQuery.isPending ? (
                                                    <Skeleton className="h-6 w-20" />
                                                ) : (
                                                    <InvoiceStatusBadge status={status} />
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {hasInvoiceLinks ? (
                                                    <div className="flex justify-end gap-2">
                                                        {status.dashboardUrl ? (
                                                            <Button variant="outline" size="sm" asChild>
                                                                <a
                                                                    href={status.dashboardUrl}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    onClick={(event) => event.stopPropagation()}
                                                                >
                                                                    Dashboard
                                                                    <ExternalLink className="ml-2 h-4 w-4" />
                                                                </a>
                                                            </Button>
                                                        ) : null}
                                                        {status.paymentUrl ? (
                                                            <Button variant="outline" size="sm" asChild>
                                                                <a
                                                                    href={status.paymentUrl}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    onClick={(event) => event.stopPropagation()}
                                                                >
                                                                    Payment
                                                                    <ExternalLink className="ml-2 h-4 w-4" />
                                                                </a>
                                                            </Button>
                                                        ) : null}
                                                    </div>
                                                ) : null}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <SendInvoicesDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                loading={sendInvoicesMutation.isPending}
                onConfirm={handleSendInvoices}
            />
            <UnenrollEnrolmentsDialog
                open={isUnenrollDialogOpen}
                onOpenChange={setIsUnenrollDialogOpen}
                loading={unenrollMutation.isPending}
                count={selectedIds.length}
                onConfirm={handleUnenroll}
            />
        </div>
    )
}
