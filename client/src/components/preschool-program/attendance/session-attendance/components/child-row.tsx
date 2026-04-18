import { useMutation, useQueryClient } from '@tanstack/react-query'
import { differenceInYears } from 'date-fns'
import { ChevronRightIcon, EllipsisVertical, Loader2, LogIn, LogOut } from 'lucide-react'
import { useState } from 'react'

import { AcuityConstants } from 'fizz-kidz'
import type { AcuityTypes } from 'fizz-kidz'

import { Badge } from '@ui-components/badge'
import { Button } from '@ui-components/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@ui-components/dropdown-menu'
import { TableCell } from '@ui-components/table'
import { cn } from '@utils/tailwind'
import { useTRPC } from '@utils/trpc'

import { SignOutDialog } from './sign-out-dialog'
import { useParams } from '../hooks/use-params'

import type { PreschoolProgramAttendanceEnrolment } from '../utils/get-enrolment'

export function ChildRow({
    appointment,
    enrolment,
}: {
    appointment: AcuityTypes.Api.Appointment
    enrolment: PreschoolProgramAttendanceEnrolment
}) {
    const trpc = useTRPC()
    const params = useParams()
    const queryClient = useQueryClient()
    const [isSignOutOpen, setIsSignOutOpen] = useState(false)

    const { mutateAsync: updateLabel, isPending: isUpdatingLabel } = useMutation(
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

    const { mutateAsync: updateEnrolment, isPending: isUpdatingEnrolment } = useMutation(
        trpc.preschoolProgram.updateEnrolment.mutationOptions({
            onSuccess: (updatedEnrolment) => {
                if (!params) return
                queryClient.setQueryData(
                    trpc.preschoolProgram.listEnrolments.queryKey({ appointmentTypeId: params.appointmentTypeId }),
                    (cachedEnrolments) => {
                        if (!cachedEnrolments) return []
                        return cachedEnrolments.map((cachedEnrolment) =>
                            cachedEnrolment.id === updatedEnrolment.id ? updatedEnrolment : cachedEnrolment
                        )
                    }
                )
            },
        })
    )

    const label = appointment.labels?.[0]?.id
    const isCheckedIn = label === AcuityConstants.Labels.CHECKED_IN
    const isCheckedOut = label === AcuityConstants.Labels.CHECKED_OUT
    const isNotAttending = label === AcuityConstants.Labels.NOT_ATTENDING
    const isPending = isUpdatingLabel || isUpdatingEnrolment
    const childAge = differenceInYears(
        new Date(params?.classTime || enrolment.child.dob),
        new Date(enrolment.child.dob)
    )

    async function handleSignIn(event: React.MouseEvent) {
        event.stopPropagation()
        await updateLabel({ appointmentId: appointment.id, label: 'checked-in' })
    }

    async function handleSignOut({ pickupPerson, staffReason }: { pickupPerson: string; staffReason: string }) {
        await updateEnrolment({
            id: enrolment.id,
            signatures: {
                ...enrolment.signatures,
                [appointment.id]: {
                    pickupPerson,
                    signature: '',
                    timestamp: Date.now(),
                    staffReason,
                },
            },
        })
        await updateLabel({ appointmentId: appointment.id, label: 'checked-out' })
        setIsSignOutOpen(false)
    }

    async function clearSignature() {
        await updateEnrolment({
            id: enrolment.id,
            signatures: {
                ...enrolment.signatures,
                [appointment.id]: '',
            },
        })
    }

    async function handleUndoSignOut(event: React.MouseEvent | Event) {
        event.stopPropagation()
        await clearSignature()
        await updateLabel({ appointmentId: appointment.id, label: 'checked-in' })
    }

    function renderActionButton() {
        if (!label) {
            return (
                <Button className="sm:min-w-24" size="sm" onClick={handleSignIn}>
                    <LogIn className="size-4 sm:hidden" />
                    <span className="hidden sm:block">Sign in</span>
                </Button>
            )
        }

        if (isCheckedIn) {
            return (
                <Button
                    className="sm:min-w-24"
                    size="sm"
                    variant="outline"
                    onClick={(event) => {
                        event.stopPropagation()
                        setIsSignOutOpen(true)
                    }}
                >
                    <LogOut className="size-4 sm:hidden" />
                    <span className="hidden sm:block">Sign out</span>
                </Button>
            )
        }

        return null
    }

    return (
        <>
            <TableCell
                className={cn('p-2', {
                    'shadow-[inset_4px_0_0_0_theme(colors.green.500)]': isCheckedIn,
                    'shadow-[inset_4px_0_0_0_theme(colors.red.500)]': isCheckedOut,
                    'shadow-[inset_4px_0_0_0_theme(colors.violet.500)]': isNotAttending,
                })}
                id="arrow"
            >
                <ChevronRightIcon className="size-4 shrink-0 transition-transform duration-200" />
            </TableCell>
            <TableCell className="p-2">
                {isNotAttending ? (
                    <del>{`${enrolment.child.firstName} ${enrolment.child.lastName}`}</del>
                ) : (
                    `${enrolment.child.firstName} ${enrolment.child.lastName}`
                )}
            </TableCell>
            <TableCell className="hidden w-1/4 p-2 sm:table-cell">{childAge}</TableCell>
            <TableCell className="hidden w-1/4 p-2 text-center sm:table-cell">
                <div className="flex justify-center gap-2">
                    <Badge>Term Enrolment</Badge>
                    {enrolment.child.allergies ? <Badge variant="destructive">Allergies</Badge> : null}
                    {isNotAttending ? <Badge variant="secondary">Not Attending</Badge> : null}
                </div>
            </TableCell>
            <TableCell className="p-2 text-center">
                <div className="flex justify-center gap-2">
                    {isPending ? (
                        <Loader2 className="animate-spin" />
                    ) : (
                        <>
                            {renderActionButton()}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(event) => event.stopPropagation()}
                                        onPointerDown={(event) => event.stopPropagation()}
                                    >
                                        <EllipsisVertical className="size-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {!label ? (
                                        <DropdownMenuItem
                                            onClick={(event) => {
                                                event.stopPropagation()
                                                void updateLabel({
                                                    appointmentId: appointment.id,
                                                    label: 'not-attending',
                                                })
                                            }}
                                            onPointerDown={(event) => event.stopPropagation()}
                                        >
                                            Mark not attending
                                        </DropdownMenuItem>
                                    ) : null}
                                    {isCheckedIn ? (
                                        <DropdownMenuItem
                                            onClick={(event) => {
                                                event.stopPropagation()
                                                void updateLabel({ appointmentId: appointment.id, label: 'none' })
                                            }}
                                            onPointerDown={(event) => event.stopPropagation()}
                                        >
                                            Undo sign in
                                        </DropdownMenuItem>
                                    ) : null}
                                    {isCheckedOut ? (
                                        <DropdownMenuItem
                                            onClick={(event) => {
                                                void handleUndoSignOut(event)
                                            }}
                                            onPointerDown={(event) => event.stopPropagation()}
                                        >
                                            Undo sign out
                                        </DropdownMenuItem>
                                    ) : null}
                                    {isNotAttending ? (
                                        <DropdownMenuItem
                                            onClick={(event) => {
                                                event.stopPropagation()
                                                void updateLabel({ appointmentId: appointment.id, label: 'none' })
                                            }}
                                            onPointerDown={(event) => event.stopPropagation()}
                                        >
                                            Mark attending
                                        </DropdownMenuItem>
                                    ) : null}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    )}
                </div>
            </TableCell>
            <SignOutDialog
                open={isSignOutOpen}
                onOpenChange={setIsSignOutOpen}
                parentName={`${enrolment.parent.firstName} ${enrolment.parent.lastName}`}
                emergencyContactName={enrolment.emergencyContact.name}
                onConfirm={handleSignOut}
                loading={isPending}
            />
        </>
    )
}
