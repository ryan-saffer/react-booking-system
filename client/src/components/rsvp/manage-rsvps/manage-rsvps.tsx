import { CheckCircle2, Eye, Frown, Share2, Sparkles, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import { Fragment, useState } from 'react'
import { doc, updateDoc } from 'firebase/firestore'

import useFirebase from '@components/Hooks/context/UseFirebase'
import { flexRender } from '@tanstack/react-table'
import { Button } from '@ui-components/button'
import { Skeleton } from '@ui-components/skeleton'
import { Switch } from '@ui-components/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ui-components/table'
import { cn } from '@utils/tailwind'

import { useInvitation } from '../hooks/use-invitation'
import type { UseRsvpTableProps } from '../hooks/use-rsvp-table'
import { useRsvpTable } from '../hooks/use-rsvp-table'
import { useRsvps } from '../hooks/use-rsvps'
import { EditInvitationDialog } from './edit-invitation-dialog'
import { ShareInvitaitonDialog } from './share-invitation-dialog'
import type { InvitationsV2 } from 'fizz-kidz'
import { useAuth } from '@components/Hooks/context/useAuth'

const emptyState: UseRsvpTableProps = {
    rsvps: [],
    updateRsvp: () => {},
    deleteRsvp: () => {},
}

export function ManageRsvps() {
    const firebase = useFirebase()
    const invitation = useInvitation()
    const rsvps = useRsvps(invitation)

    const auth = useAuth()

    const table = useRsvpTable(
        rsvps.status === 'loaded'
            ? {
                  rsvps: rsvps.result.rsvps,
                  updateRsvp: rsvps.result.updateRsvp,
                  deleteRsvp: rsvps.result.deleteRsvp,
              }
            : emptyState
    )

    const [showShareDialog, setShowShareDialog] = useState(false)
    const [showEditDialog, setShowEditDialog] = useState(false)

    const isLoaded = rsvps.status === 'loaded'
    const attendingCount = isLoaded ? rsvps.result.attendingCount : 0
    const notAttendingCount = isLoaded ? rsvps.result.notAttendingCount : 0
    const totalResponses = isLoaded ? rsvps.result.rsvps.reduce((acc, curr) => (acc += curr.children.length), 0) : 0
    const colSpan = table.getVisibleFlatColumns().length

    function updateRsvpNotifications(rsvpNotificationsEnabled: boolean) {
        updateDoc(doc(firebase.db, 'invitations-v2', invitation.id), {
            rsvpNotificationsEnabled,
        } satisfies Partial<InvitationsV2.Invitation>)
    }

    return (
        <div className="twp min-h-screen bg-gradient-to-br from-[#F7F1FF] via-white to-[#EAF6FF]">
            <div className="mx-auto max-w-6xl px-4 pb-28 pt-4 sm:px-6 sm:pb-16 lg:px-8">
                <div className="my-4 grid gap-3 sm:grid-cols-[2fr_1fr]">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1">
                            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                                Manage RSVPs
                            </p>
                            <p className="flex items-center gap-2 font-lilita text-2xl text-slate-900 sm:text-3xl">
                                <Sparkles className="h-5 w-5 text-[#9B3EEA]" />
                                {invitation.childName}&apos;s guest list
                            </p>
                            <p className="text-sm text-slate-600">
                                Track responses, view details, and resend your invitation link anytime.
                            </p>
                        </div>
                    </div>
                    {auth?.uid === invitation.uid && (
                        <div className="flex items-center justify-between rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm text-slate-700 shadow sm:px-5">
                            <div>
                                <p className="font-semibold text-slate-900">Email notifications</p>
                                <p className="text-xs text-slate-600">Get an email when guests RSVP.</p>
                            </div>
                            <Switch
                                checked={invitation.rsvpNotificationsEnabled}
                                onCheckedChange={(checked) => updateRsvpNotifications(checked)}
                            />
                        </div>
                    )}
                </div>

                <div className="hidden w-full items-center justify-start gap-2 sm:flex">
                    <Button
                        className="w-full gap-2 rounded-xl bg-[#9B3EEA] font-semibold shadow hover:bg-[#8B2DE3]"
                        onClick={() => setShowShareDialog(true)}
                    >
                        <Share2 className="h-4 w-4" />
                        Share invitation
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full gap-2 rounded-xl border-slate-200"
                        onClick={() => setShowEditDialog(true)}
                    >
                        <Eye className="h-4 w-4" />
                        Preview invitation
                    </Button>
                </div>

                {rsvps.status === 'loading' && <Skeleton className="mt-8 h-[260px] w-full rounded-2xl" />}

                {rsvps.status === 'loaded' && (
                    <>
                        <div className="mt-4 flex flex-wrap gap-2 sm:hidden">
                            <SummaryChip icon={<Users className="h-4 w-4" />} label="Total" value={totalResponses} />
                            <SummaryChip
                                icon={<CheckCircle2 className="h-4 w-4" />}
                                label="Attending"
                                value={attendingCount}
                                tone="green"
                            />
                            <SummaryChip
                                icon={<Frown className="h-4 w-4" />}
                                label="Not attending"
                                value={notAttendingCount}
                                tone="rose"
                            />
                        </div>

                        <div className="mt-6 hidden grid-cols-3 gap-4 sm:grid">
                            <SummaryCard
                                icon={<Users className="h-5 w-5" />}
                                label="Total responses"
                                value={totalResponses}
                                tone="slate"
                            />
                            <SummaryCard
                                icon={<CheckCircle2 className="h-5 w-5" />}
                                label="Attending"
                                value={attendingCount}
                                tone="green"
                            />
                            <SummaryCard
                                icon={<Frown className="h-5 w-5" />}
                                label="Unable to attend"
                                value={notAttendingCount}
                                tone="rose"
                            />
                        </div>

                        <div className="mb-4 mt-4 overflow-hidden rounded-2xl border border-white/70 bg-white/80 shadow-[0px_0px_16px_rgba(17,17,26,0.1)] backdrop-blur sm:mt-6">
                            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-6">
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">Guest list & RSVPs</p>
                                    <p className="text-xs text-slate-600">
                                        Tap a guest row to see parent details and notes.
                                    </p>
                                </div>
                                <div className="rounded-full bg-[#F2E7FF] px-3 py-1 text-xs font-semibold text-[#9B3EEA]">
                                    Live updates
                                </div>
                            </div>
                            <div className="overflow-auto">
                                <Table className="w-full table-auto">
                                    <TableHeader>
                                        {table.getHeaderGroups().map((headerGroup) => (
                                            <TableRow key={headerGroup.id} className="bg-slate-50/60">
                                                {headerGroup.headers.map((header) => {
                                                    return (
                                                        <TableHead
                                                            key={header.id}
                                                            className={cn(
                                                                'px-2 py-2 text-xs sm:px-3 sm:py-3 sm:text-sm',
                                                                header.column.columnDef.meta?.headerClassName
                                                            )}
                                                        >
                                                            {header.isPlaceholder
                                                                ? null
                                                                : flexRender(
                                                                      header.column.columnDef.header,
                                                                      header.getContext()
                                                                  )}
                                                        </TableHead>
                                                    )
                                                })}
                                            </TableRow>
                                        ))}
                                    </TableHeader>
                                    <TableBody>
                                        {table.getRowModel().rows?.length ? (
                                            table.getRowModel().rows.map((row) => (
                                                <Fragment key={row.id}>
                                                    <TableRow
                                                        onClick={() => row.toggleExpanded(!row.getIsExpanded())}
                                                        className="cursor-pointer transition hover:bg-[#F7F1FF]/60 data-[state=selected]:bg-[#F2E7FF]/70"
                                                        data-state={row.getIsExpanded() && 'selected'}
                                                    >
                                                        {row.getVisibleCells().map((cell) => (
                                                            <TableCell
                                                                key={cell.id}
                                                                className={cn(
                                                                    'p-2 text-xs sm:p-3 sm:text-sm',
                                                                    cell.column.columnDef.meta?.cellClassName
                                                                )}
                                                            >
                                                                {flexRender(
                                                                    cell.column.columnDef.cell,
                                                                    cell.getContext()
                                                                )}
                                                            </TableCell>
                                                        ))}
                                                    </TableRow>
                                                    {row.getIsExpanded() && (
                                                        <>
                                                            {row.original.hasAllergies && row.original.allergies && (
                                                                <ExpandableContent
                                                                    label="Allergies"
                                                                    value={row.original.allergies}
                                                                    colSpan={colSpan}
                                                                />
                                                            )}
                                                            <ExpandableContent
                                                                label="Parent Name"
                                                                value={row.original.parentName}
                                                                colSpan={colSpan}
                                                            />
                                                            <ExpandableContent
                                                                label="Parent Phone"
                                                                value={row.original.parentMobile}
                                                                colSpan={colSpan}
                                                            />
                                                            <ExpandableContent
                                                                label="Parent Email"
                                                                value={row.original.parentEmail}
                                                                colSpan={colSpan}
                                                            />
                                                            {row.original.message && (
                                                                <ExpandableContent
                                                                    label="Message"
                                                                    value={row.original.message}
                                                                    colSpan={colSpan}
                                                                />
                                                            )}
                                                        </>
                                                    )}
                                                </Fragment>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={table.getAllColumns().length}
                                                    className="h-28 text-center text-sm text-slate-600"
                                                >
                                                    No RSVPs yet. Share your invitation to start collecting responses.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <EditInvitationDialog
                isOpen={showEditDialog}
                close={() => setShowEditDialog(false)}
                share={() => setShowShareDialog(true)}
            />
            <ShareInvitaitonDialog isOpen={showShareDialog} close={() => setShowShareDialog(false)} />

            <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/90 backdrop-blur">
                <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-3 sm:flex-row sm:px-6">
                    <Button
                        variant="outline"
                        className="w-full gap-2 rounded-xl border-slate-200"
                        onClick={() => setShowEditDialog(true)}
                    >
                        <Eye className="h-4 w-4" />
                        Preview invitation
                    </Button>
                    <Button
                        className="w-full gap-2 rounded-xl bg-[#9B3EEA] font-semibold hover:bg-[#8B2DE3]"
                        onClick={() => setShowShareDialog(true)}
                    >
                        <Share2 className="h-4 w-4" />
                        Share invitation
                    </Button>
                </div>
            </div>
        </div>
    )
}

function ExpandableContent({ label, value, colSpan }: { label: string; value: string; colSpan: number }) {
    return (
        <TableRow className="bg-slate-50/70">
            <TableCell className="p-3" colSpan={colSpan}>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                    <span className="w-[140px] text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 sm:ml-12 sm:w-[180px]">
                        {label}
                    </span>
                    <span className="text-sm text-slate-700">{value}</span>
                </div>
            </TableCell>
        </TableRow>
    )
}

function SummaryCard({
    icon,
    label,
    value,
    tone = 'slate',
}: {
    icon: ReactNode
    label: string
    value: number
    tone?: 'slate' | 'green' | 'rose'
}) {
    const toneClasses =
        tone === 'green'
            ? 'bg-emerald-50 text-emerald-700'
            : tone === 'rose'
              ? 'bg-rose-50 text-rose-700'
              : 'bg-slate-50 text-slate-700'
    return (
        <div className="flex items-center justify-between rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-md backdrop-blur">
            <div className="flex items-center gap-3">
                <div className={cn('rounded-full p-2', toneClasses)}>{icon}</div>
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{label}</p>
                    <p className="text-2xl font-bold text-slate-900">{value}</p>
                </div>
            </div>
        </div>
    )
}

function SummaryChip({
    icon,
    label,
    value,
    tone = 'slate',
}: {
    icon: ReactNode
    label: string
    value: number
    tone?: 'slate' | 'green' | 'rose'
}) {
    const toneClasses =
        tone === 'green'
            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
            : tone === 'rose'
              ? 'bg-rose-100 text-rose-800 border-rose-200'
              : 'bg-slate-100 text-slate-800 border-slate-200'
    return (
        <div
            className={cn(
                'inline-flex min-w-[112px] items-center gap-2 rounded-full border px-3 py-1.5 text-xs',
                toneClasses
            )}
        >
            <div className="rounded-full bg-white/70 p-1 text-current">{icon}</div>
            <div className="flex w-full items-center justify-between gap-2">
                <span className="font-semibold">{label}</span>
                <span className="text-sm font-bold">{value}</span>
            </div>
        </div>
    )
}
