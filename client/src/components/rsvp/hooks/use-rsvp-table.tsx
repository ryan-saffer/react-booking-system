import { getCoreRowModel, getExpandedRowModel, useReactTable } from '@tanstack/react-table'
import { useMemo } from 'react'
import { createColumns, RsvpRow } from '../manage-rsvps/columns'
import { Rsvp } from 'fizz-kidz'

export type UseRsvpProps = {
    rsvps: Rsvp[]
    updateRsvp: (id: string, rsvp: Rsvp['rsvp']) => Promise<void> | void
}

export function useRsvpTable({ rsvps, updateRsvp }: UseRsvpProps) {
    // this reduces each child into its own row, along with the parent details
    const data = useMemo(
        () =>
            rsvps.reduce((acc, curr) => {
                const { children, ...rest } = curr
                return [...acc, ...children.map((child) => ({ ...rest, ...child }))]
            }, [] as RsvpRow[]),
        [rsvps]
    )

    const table = useReactTable<RsvpRow>({
        columns: createColumns({ updateRsvp }),
        data,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
    })

    return table
}
