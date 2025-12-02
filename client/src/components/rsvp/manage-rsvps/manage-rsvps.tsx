import { Fragment, useState } from 'react'

import { flexRender } from '@tanstack/react-table'
import { Button } from '@ui-components/button'
import { Skeleton } from '@ui-components/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ui-components/table'
import { cn } from '@utils/tailwind'

import { useInvitation } from '../hooks/use-invitation'
import type { UseRsvpTableProps } from '../hooks/use-rsvp-table'
import { useRsvpTable } from '../hooks/use-rsvp-table'
import { useRsvps } from '../hooks/use-rsvps'
import { EditInvitationDialog } from './edit-invitation-dialog'
import { ShareInvitaitonDialog } from './share-invitation-dialog'

const emptyState: UseRsvpTableProps = {
    rsvps: [],
    updateRsvp: () => {},
    deleteRsvp: () => {},
}

export function ManageRsvps() {
    const invitation = useInvitation()
    const rsvps = useRsvps(invitation)

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

    return (
        <>
            <div className="p-4 pb-20">
                {rsvps.status === 'loading' && <Skeleton className="h-[200px]" />}
                {rsvps.status === 'loaded' && (
                    <div className="m-auto w-full max-w-5xl">
                        <p className="my-2 text-center text-2xl font-bold">RSVP Status</p>
                        <p className="mb-6 mt-2 text-center text-xl">
                            <span className="font-extrabold">{rsvps.result.attendingCount}</span> Attending,{' '}
                            <span className="font-extrabold">{rsvps.result.notAttendingCount}</span> Unable to attend
                        </p>
                        <div className="rounded-md border">
                            <Table className="table-fixed">
                                <TableHeader>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <TableRow key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => {
                                                return (
                                                    <TableHead
                                                        key={header.id}
                                                        className={cn(
                                                            'px-2 text-xs sm:text-sm',
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
                                                    className="cursor-pointer"
                                                    data-state={row.getIsExpanded() && 'selected'}
                                                >
                                                    {row.getVisibleCells().map((cell) => (
                                                        <TableCell
                                                            key={cell.id}
                                                            className={cn(
                                                                'p-2',
                                                                cell.column.columnDef.meta?.cellClassName
                                                            )}
                                                        >
                                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                                {row.getIsExpanded() && (
                                                    <>
                                                        {row.original.hasAllergies && row.original.allergies && (
                                                            <ExpandableContent
                                                                label="Allergies"
                                                                value={row.original.allergies}
                                                            />
                                                        )}
                                                        <ExpandableContent
                                                            label="Parent Name:"
                                                            value={row.original.parentName}
                                                        />
                                                        <ExpandableContent
                                                            label="Parent Phone:"
                                                            value={row.original.parentMobile}
                                                        />
                                                        <ExpandableContent
                                                            label="Parent Email:"
                                                            value={row.original.parentEmail}
                                                        />
                                                        {row.original.message && (
                                                            <ExpandableContent
                                                                label="Message:"
                                                                value={row.original.message}
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
                                                className="h-24 text-center"
                                            >
                                                No one has RSVP'd yet. Click the share button to share your invitation
                                                with all of {invitation.childName}'s friends!
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}
            </div>
            <EditInvitationDialog isOpen={showEditDialog} close={() => setShowEditDialog(false)} />
            <ShareInvitaitonDialog isOpen={showShareDialog} close={() => setShowShareDialog(false)} />
            <div className="fixed bottom-0 flex h-16 w-full">
                <Button
                    variant="blue"
                    className="h-full w-full text-wrap rounded-none p-4 font-bold uppercase"
                    onClick={() => setShowEditDialog(true)}
                >
                    Preview Invitation
                </Button>
                <Button
                    variant="yellow"
                    className="h-full w-full text-wrap rounded-none p-4 font-bold uppercase"
                    onClick={() => setShowShareDialog(true)}
                >
                    Share Invitation
                </Button>
            </div>
        </>
    )
}

function ExpandableContent({ label, value }: { label: string; value: string }) {
    return (
        <TableRow>
            <TableCell />
            <TableCell className="p-2" colSpan={1}>
                {label}
            </TableCell>
            <TableCell className="p-2" colSpan={3}>
                {value}
            </TableCell>
        </TableRow>
    )
}
