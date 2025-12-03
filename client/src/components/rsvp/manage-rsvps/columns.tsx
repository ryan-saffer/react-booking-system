import type { Rsvp, RsvpStatus } from 'fizz-kidz'
import { ChevronRight, EllipsisVertical, Trash2 } from 'lucide-react'

import { createColumnHelper } from '@tanstack/react-table'
import { Badge } from '@ui-components/badge'
import { Button } from '@ui-components/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@ui-components/dropdown-menu'
import { cn } from '@utils/tailwind'

import type { UseRsvpTableProps } from '../hooks/use-rsvp-table'

// An rsvp can have multiple children, but we want a row for every child
export type RsvpRow = Omit<Rsvp, 'children'> & Rsvp['children'][number] & { childIdx: number }

const columnHelper = createColumnHelper<RsvpRow>()

export function createColumns({
    updateRsvp,
    deleteRsvp,
}: {
    updateRsvp: UseRsvpTableProps['updateRsvp']
    deleteRsvp: UseRsvpTableProps['deleteRsvp']
}) {
    return [
        columnHelper.display({
            id: 'chevron',
            cell: ({ row }) => (
                <ChevronRight
                    className={cn('h-4 w-4 transition-transform duration-500', { 'rotate-90': row.getIsExpanded() })}
                />
            ),
            meta: {
                headerClassName: 'w-10 sm:w-12',
                cellClassName: 'pl-2 sm:pl-4',
            },
        }),
        columnHelper.accessor('name', {
            header: () => <div>Child name</div>,
        }),
        columnHelper.accessor('rsvp', {
            header: () => <div>RSVP</div>,
            cell: (rsvp) => {
                const isAttending = rsvp.getValue() === 'attending'

                return <Badge variant={isAttending ? 'success' : 'destructive'}>{isAttending ? 'Yes' : 'No'}</Badge>
            },
        }),
        columnHelper.accessor('hasAllergies', {
            header: () => <div>Has allergies?</div>,
            cell: (rsvp) => rsvp.getValue() && <Badge variant="destructive">Yes</Badge>,
            meta: {
                headerClassName: 'hidden sm:table-cell',
                cellClassName: 'hidden sm:table-cell',
            },
        }),
        columnHelper.display({
            id: 'action',
            meta: {
                headerClassName: 'w-12 sm:w-16',
            },
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className={row.getIsExpanded() ? 'hover:bg-white/50' : ''}>
                            <EllipsisVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="twp w-56" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuLabel>RSVP</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup
                            value={row.original.rsvp}
                            onValueChange={(value) =>
                                updateRsvp(row.original.id, row.original.childIdx, value as RsvpStatus)
                            }
                        >
                            <DropdownMenuRadioItem value="attending">Attending</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="not-attending">Not Attending</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => deleteRsvp(row.original.id, row.original.childIdx)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete RSVP
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        }),
    ]
}
