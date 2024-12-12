import { Rsvp, RsvpStatus } from 'fizz-kidz'
import { useMemo } from 'react'

import { getCoreRowModel, getExpandedRowModel, useReactTable } from '@tanstack/react-table'

import { RsvpRow, createColumns } from '../manage-rsvps/columns'

export type UseRsvpTableProps = {
    rsvps: Rsvp[]
    updateRsvp: (id: string, childIdx: number, rsvp: RsvpStatus) => Promise<void> | void
    deleteRsvp: (id: string, childIdx: number) => Promise<void> | void
}

export function useRsvpTable({ rsvps, updateRsvp, deleteRsvp }: UseRsvpTableProps) {
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
        columns: createColumns({ updateRsvp, deleteRsvp }),
        data,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
    })

    return table
}
