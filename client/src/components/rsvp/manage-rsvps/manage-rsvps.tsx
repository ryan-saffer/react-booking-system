import { InvitationsV2 } from 'fizz-kidz'

import { useRsvps } from '../hooks/use-rsvps'
import { UseRsvpTableProps, useRsvpTable } from '../hooks/use-rsvp-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ui-components/table'
import { flexRender } from '@tanstack/react-table'
import { Skeleton } from '@ui-components/skeleton'
import { Fragment, useState } from 'react'
import { cn } from '@utils/tailwind'
import { ShareInvitaitonDialog } from './share-invitation-dialog'
import { EditInvitationDialog } from './edit-invitation-dialog'

const emptyState: UseRsvpTableProps = {
    rsvps: [],
    updateRsvp: () => {},
}

export function ManageRsvps({ invitation }: { invitation: InvitationsV2.Invitation }) {
    const rsvps = useRsvps(invitation)

    const table = useRsvpTable(
        rsvps.status === 'loaded'
            ? {
                  rsvps: rsvps.result.rsvps,
                  updateRsvp: rsvps.result.updateRsvp,
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
                                                No RSVP's.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}
            </div>
            <EditInvitationDialog
                invitation={invitation}
                isOpen={showEditDialog}
                close={() => setShowEditDialog(false)}
            />
            <ShareInvitaitonDialog
                invitation={invitation}
                isOpen={showShareDialog}
                close={() => setShowShareDialog(false)}
            />
            <div className="fixed bottom-0 flex h-16 w-full">
                <button className="w-full bg-[#02D7F7] p-4 font-bold uppercase" onClick={() => setShowEditDialog(true)}>
                    Preview Invitation
                </button>
                <button
                    className="w-full bg-[#FFDC5D] p-4 font-bold uppercase"
                    onClick={() => setShowShareDialog(true)}
                >
                    Share Invitation
                </button>
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
