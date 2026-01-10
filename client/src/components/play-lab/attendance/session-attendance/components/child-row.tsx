import { AcuityConstants, AcuityUtilities } from 'fizz-kidz'
import type { AcuityTypes } from 'fizz-kidz'
import { ChevronRightIcon, EllipsisVertical, Loader2, LogIn, LogOut } from 'lucide-react'

import { Badge } from '@ui-components/badge'
import { Button } from '@ui-components/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@ui-components/dropdown-menu'
import { TableCell } from '@ui-components/table'
import { cn } from '@utils/tailwind'
import { useTRPC } from '@utils/trpc'

import { useParams } from '../hooks/use-params'

import { useMutation } from '@tanstack/react-query'
import { useQueryClient } from '@tanstack/react-query'

export function ChildRow({ appointment }: { appointment: AcuityTypes.Api.Appointment }) {
    const trpc = useTRPC()
    const params = useParams()
    const queryClient = useQueryClient()

    const { mutate: updateLabel, isPending } = useMutation(
        trpc.acuity.updateLabel.mutationOptions({
            // changing a label requires appointments to reflect the change
            onSuccess: (appointment) =>
                queryClient.setQueryData(trpc.acuity.searchForAppointments.queryKey(params!), (cachedAppointments) => {
                    if (!cachedAppointments) return []
                    return cachedAppointments.map((cachedApt) =>
                        cachedApt.id === appointment.id ? appointment : cachedApt
                    )
                }),
        })
    )

    const label = appointment.labels?.[0].id
    const status = label ? (label === AcuityConstants.Labels.CHECKED_IN ? 'signed-in' : 'signed-out') : 'not-signed-in'

    function renderActionButton(appointment: AcuityTypes.Api.Appointment) {
        if (!label) {
            return (
                <Button
                    className="sm:min-w-24"
                    size="sm"
                    onClick={(e) => {
                        e.stopPropagation()
                        updateLabel({ appointmentId: appointment.id, label: 'checked-in' })
                    }}
                >
                    <LogIn className="size-4 sm:hidden" />
                    <span className="hidden sm:block">Sign in</span>
                </Button>
            )
        }

        if (label === AcuityConstants.Labels.CHECKED_IN) {
            return (
                <Button
                    className="sm:min-w-24"
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                        e.stopPropagation()
                        updateLabel({ appointmentId: appointment.id, label: 'checked-out' })
                    }}
                >
                    <LogOut className="size-4 sm:hidden" />
                    <span className="hidden sm:block">Sign out</span>
                </Button>
            )
        }
    }

    function renderAction(appointment: AcuityTypes.Api.Appointment) {
        const label = appointment.labels?.[0].id
        return (
            <div className="flex justify-center gap-2">
                {isPending ? (
                    <Loader2 className="animate-spin" />
                ) : (
                    <>
                        {renderActionButton(appointment)}
                        {label && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => e.stopPropagation()}
                                        onPointerDown={(e) => e.stopPropagation()}
                                    >
                                        <EllipsisVertical className="size-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {label === AcuityConstants.Labels.CHECKED_IN && (
                                        <DropdownMenuItem
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                updateLabel({ appointmentId: appointment.id, label: 'none' })
                                            }}
                                            onPointerDown={(e) => e.stopPropagation()}
                                        >
                                            Undo sign in
                                        </DropdownMenuItem>
                                    )}
                                    {label === AcuityConstants.Labels.CHECKED_OUT && (
                                        <DropdownMenuItem
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                updateLabel({ appointmentId: appointment.id, label: 'checked-in' })
                                            }}
                                            onPointerDown={(e) => e.stopPropagation()}
                                        >
                                            Undo sign out
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </>
                )}
            </div>
        )
    }

    return (
        <>
            <TableCell
                className={cn('p-2', {
                    'shadow-[inset_4px_0_0_0_theme(colors.green.500)]': status === 'signed-in',
                    'shadow-[inset_4px_0_0_0_theme(colors.red.500)]': status === 'signed-out',
                })}
                id="arrow"
            >
                <ChevronRightIcon className="size-4 shrink-0 transition-transform duration-200" />
            </TableCell>
            <TableCell className="p-2">
                {AcuityUtilities.retrieveFormAndField(
                    appointment,
                    AcuityConstants.Forms.CHILDREN_DETAILS,
                    AcuityConstants.FormFields.CHILDREN_NAMES
                )}
            </TableCell>
            <TableCell className="hidden w-1/4 p-2 sm:table-cell">
                {AcuityUtilities.retrieveFormAndField(
                    appointment,
                    AcuityConstants.Forms.CHILDREN_DETAILS,
                    AcuityConstants.FormFields.CHILDREN_AGES
                )}
            </TableCell>
            <TableCell className="hidden w-1/4 p-2 text-center sm:table-cell">
                <div className="flex justify-center gap-2">
                    {AcuityUtilities.retrieveFormAndField(
                        appointment,
                        AcuityConstants.Forms.PAYMENT,
                        AcuityConstants.FormFields.IS_TERM_ENROLMENT
                    ) === 'yes' ? (
                        <Badge>Term Enrolment</Badge>
                    ) : (
                        <Badge variant="outline" className="bg-white">
                            Casual
                        </Badge>
                    )}
                    {AcuityUtilities.retrieveFormAndField(
                        appointment,
                        AcuityConstants.Forms.CHILDREN_DETAILS,
                        AcuityConstants.FormFields.CHILDREN_ALLERGIES
                    ) && <Badge variant="destructive">Allergies</Badge>}
                </div>
            </TableCell>
            <TableCell className="p-2 text-center">{renderAction(appointment)}</TableCell>
        </>
    )
}
