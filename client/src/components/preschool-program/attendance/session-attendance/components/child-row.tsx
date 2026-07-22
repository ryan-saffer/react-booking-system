import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, ChevronRight, EllipsisVertical, Loader2, LogIn, LogOut } from 'lucide-react'

import type { AcuityTypes } from 'fizz-kidz'

import { Badge } from '@ui-components/badge'
import { Button } from '@ui-components/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@ui-components/dropdown-menu'
import { TableCell } from '@ui-components/table'
import { cn } from '@utils/tailwind'
import { useTRPC } from '@utils/trpc'

import { useParams } from '../hooks/use-params'
import { getPreschoolAttendanceDetails, getPreschoolAttendanceStatus } from '../utils/acuity-attendance'

export function ChildRow({ appointment }: { appointment: AcuityTypes.Api.Appointment }) {
    const trpc = useTRPC()
    const params = useParams()
    const queryClient = useQueryClient()
    const details = getPreschoolAttendanceDetails(appointment)
    const status = getPreschoolAttendanceStatus(appointment)

    const updateLabelMutation = useMutation(
        trpc.acuity.updateLabel.mutationOptions({
            onSuccess: (updatedAppointment) => {
                if (!params) return
                queryClient.setQueryData(trpc.acuity.searchForAppointments.queryKey(params), (cachedAppointments) => {
                    if (!cachedAppointments) return []
                    return cachedAppointments.map((cachedAppointment) =>
                        cachedAppointment.id === updatedAppointment.id ? updatedAppointment : cachedAppointment
                    )
                })
            },
        })
    )

    function updateLabel(label: 'none' | 'checked-in' | 'checked-out') {
        updateLabelMutation.mutate({ appointmentId: appointment.id, label })
    }

    return (
        <>
            <TableCell
                id="arrow"
                className={cn('p-2', {
                    'shadow-[inset_4px_0_0_0_theme(colors.green.500)]': status === 'signed-in',
                    'shadow-[inset_4px_0_0_0_theme(colors.slate.500)]': status === 'signed-out',
                })}
            >
                <ChevronRight className="size-4 transition-transform duration-200" />
            </TableCell>
            <TableCell className="p-2 font-medium">
                <span className="inline-flex items-center gap-2">
                    {details.childName}
                    {status === 'signed-out' ? <CheckCircle2 className="size-4 text-slate-500" /> : null}
                </span>
            </TableCell>
            <TableCell className="hidden p-2 sm:table-cell">{details.childAge || '—'}</TableCell>
            <TableCell className="p-2">
                <div className="flex flex-wrap justify-center gap-1.5">
                    {details.isAnaphylactic ? (
                        <Badge variant="destructive">Anaphylaxis</Badge>
                    ) : details.allergies ? (
                        <Badge variant="destructive">Allergies</Badge>
                    ) : null}
                    {details.additionalInfo ? <Badge variant="secondary">Additional info</Badge> : null}
                    {status === 'not-attending' ? <Badge variant="secondary">Not attending</Badge> : null}
                </div>
            </TableCell>
            <TableCell className="p-2 text-right">
                <div className="flex justify-end gap-2">
                    {updateLabelMutation.isPending ? (
                        <Loader2 className="mr-3 size-5 animate-spin" />
                    ) : (
                        <>
                            {status === 'not-signed-in' || status === 'not-attending' ? (
                                <Button
                                    size="sm"
                                    className="sm:min-w-24"
                                    onClick={(event) => {
                                        event.stopPropagation()
                                        updateLabel('checked-in')
                                    }}
                                >
                                    <LogIn className="size-4 sm:hidden" />
                                    <span className="hidden sm:inline">Sign in</span>
                                </Button>
                            ) : null}
                            {status === 'signed-in' ? (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="sm:min-w-24"
                                    onClick={(event) => {
                                        event.stopPropagation()
                                        updateLabel('checked-out')
                                    }}
                                >
                                    <LogOut className="size-4 sm:hidden" />
                                    <span className="hidden sm:inline">Sign out</span>
                                </Button>
                            ) : null}
                            {status !== 'not-signed-in' ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            aria-label="Attendance actions"
                                            onClick={(event) => event.stopPropagation()}
                                            onPointerDown={(event) => event.stopPropagation()}
                                        >
                                            <EllipsisVertical className="size-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        {status === 'signed-in' ? (
                                            <DropdownMenuItem
                                                onClick={(event) => {
                                                    event.stopPropagation()
                                                    updateLabel('none')
                                                }}
                                            >
                                                Undo sign in
                                            </DropdownMenuItem>
                                        ) : null}
                                        {status === 'signed-out' ? (
                                            <DropdownMenuItem
                                                onClick={(event) => {
                                                    event.stopPropagation()
                                                    updateLabel('checked-in')
                                                }}
                                            >
                                                Undo sign out
                                            </DropdownMenuItem>
                                        ) : null}
                                        {status === 'not-attending' ? (
                                            <DropdownMenuItem
                                                onClick={(event) => {
                                                    event.stopPropagation()
                                                    updateLabel('none')
                                                }}
                                            >
                                                Mark attending
                                            </DropdownMenuItem>
                                        ) : null}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : null}
                        </>
                    )}
                </div>
            </TableCell>
        </>
    )
}
