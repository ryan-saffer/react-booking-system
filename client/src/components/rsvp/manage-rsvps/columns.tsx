import { createColumnHelper } from '@tanstack/react-table'
import { Badge } from '@ui-components/badge'
import { Button } from '@ui-components/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@ui-components/dropdown-menu'
import { cn } from '@utils/tailwind'
import { Rsvp } from 'fizz-kidz'
import { ChevronRight, EllipsisVertical } from 'lucide-react'
import { UseRsvpTableProps } from '../hooks/use-rsvp-table'

// An rsvp can have multiple children, but we want a row for every child
export type RsvpRow = Omit<Rsvp, 'children'> & Rsvp['children'][number]

const columnHelper = createColumnHelper<RsvpRow>()

export function createColumns({ updateRsvp }: { updateRsvp: UseRsvpTableProps['updateRsvp'] }) {
    return [
        columnHelper.display({
            id: 'chevron',
            cell: ({ row }) => (
                <ChevronRight className={cn('h-4 w-4 transition-transform', { 'rotate-90': row.getIsExpanded() })} />
            ),
            meta: {
                headerClassName: 'w-10',
                cellClassName: 'pl-4',
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
        }),
        columnHelper.display({
            id: 'action',
            meta: {
                headerClassName: 'w-16',
            },
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className={row.getIsExpanded() ? 'hover:bg-white/50' : ''}>
                            <EllipsisVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>RSVP</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup
                            onClick={(e) => e.stopPropagation()}
                            value={row.original.rsvp}
                            onValueChange={(value) => updateRsvp(row.original.id, value as Rsvp['rsvp'])}
                        >
                            <DropdownMenuRadioItem value="attending">Attending</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="not-attending">Not Attending</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        }),
    ]
}
