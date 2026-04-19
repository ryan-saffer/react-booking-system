import { getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useMemo } from 'react'

import type { Rsvp, RsvpStatus } from 'fizz-kidz'

import { createColumns } from '../manage-rsvps/columns'

import type { RsvpRow } from '../manage-rsvps/columns'

export type UseRsvpTableProps = {
    rsvps: Rsvp[]
    updateRsvp: (id: string, childIdx: number, rsvp: RsvpStatus) => Promise<void> | void
    deleteRsvp: (id: string, childIdx: number) => Promise<void> | void
}

export function useRsvpTable({
    rsvps,
    updateRsvp,
    deleteRsvp,
    isExpanded = () => false,
}: UseRsvpTableProps & { isExpanded?: (row: RsvpRow) => boolean }) {
    // this reduces each child into its own row, along with the parent details
    const data = useMemo(
        () =>
            rsvps.reduce((acc, curr) => {
                const { children, ...rest } = curr
                return [...acc, ...children.map((child, idx) => ({ ...rest, ...child, childIdx: idx }))]
            }, [] as RsvpRow[]),
        [rsvps]
    )

    const table = useReactTable<RsvpRow>({
        columns: createColumns({ updateRsvp, deleteRsvp, isExpanded }),
        data,
        getCoreRowModel: getCoreRowModel(),
    })

    return table
}
