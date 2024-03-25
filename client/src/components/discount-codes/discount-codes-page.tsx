import { format } from 'date-fns'
import { DiscountCode, Service } from 'fizz-kidz'
import { ArrowUpDown, CalendarIcon, MoreHorizontal } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Toaster, toast } from 'sonner'

import useFirebase from '@components/Hooks/context/UseFirebase'
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table'
import { Button } from '@ui-components/button'
import { Calendar } from '@ui-components/calendar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@ui-components/dropdown-menu'
import { Input } from '@ui-components/input'
import { Popover, PopoverContent, PopoverTrigger } from '@ui-components/popover'
import { Skeleton } from '@ui-components/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ui-components/table'
import { timestampConverter } from '@utils/firebase/converters'
import { cn } from '@utils/tailwind'

import { NewCodeDialog } from './create-discount-code-dialog'

export const DiscountCodesPage = () => {
    const firebase = useFirebase()
    const [data, setData] = useState<Service<DiscountCode[]>>({ status: 'loading' })

    const [calendarsOpen, setCalendarsOpen] = useState<Record<string, boolean>>({})

    useEffect(() => {
        const unsubscribe = firebase.db
            .collection('discountCodes')
            .withConverter(timestampConverter)
            .onSnapshot((codes) =>
                setData({ status: 'loaded', result: codes.docs.map((it) => it.data() as DiscountCode) })
            )
        return () => unsubscribe()
    }, [firebase])

    const updateDiscountCode = async (code: DiscountCode) => {
        try {
            await firebase.db.collection('discountCodes').doc(code.id).set(code, { merge: true })
            toast.success('Discount code updated.')
        } catch (err) {
            console.error({ err })
            toast.error('Unable to update discount code.')
        }
    }

    const renderDiscountAmount = (amount: number, as: 'price' | 'percentage') => {
        return as === 'price' ? `$${amount}` : `${amount}%`
    }

    const deleteCode = async (id: string) => {
        try {
            await firebase.db.collection('discountCodes').doc(id).delete()
            toast.success('Discount code deleted.')
        } catch (err) {
            console.error(err)
            toast.error('An error occured deleting discount code.')
        }
    }

    const columns: ColumnDef<DiscountCode>[] = [
        {
            accessorKey: 'code',
            header: ({ column }) => {
                return (
                    <div className="text-center">
                        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                            Discount Code
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                )
            },
            cell: ({ row }) => <div className="text-center">{row.getValue('code')}</div>,
        },
        {
            id: 'discountAmount',
            header: () => <div className="text-center">Discount Amount</div>,
            accessorFn: (row) => renderDiscountAmount(row.discountAmount, row.discountType),
            cell: ({ row }) => (
                <Input
                    id={`discountAmount-${row.id}`}
                    autoComplete="off"
                    className="border-none bg-transparent text-center"
                    defaultValue={row.getValue('discountAmount')}
                    onFocus={() => {
                        const input = document.getElementById(`discountAmount-${row.id}`) as HTMLInputElement
                        input.value = row.original.discountAmount.toString()
                    }}
                    onKeyUp={(e) => {
                        if (e.key === 'Enter') {
                            document.getElementById(`discountAmount-${row.id}`)?.blur()
                        }
                    }}
                    onBlur={(e) => {
                        const newValue = parseInt(e.target.value)
                        const input = document.getElementById(`discountAmount-${row.id}`) as HTMLInputElement

                        const resetToOriginal = () =>
                            (input.value = renderDiscountAmount(row.original.discountAmount, row.original.discountType))

                        if (newValue === row.original.discountAmount) {
                            resetToOriginal()
                            return
                        }

                        if (isNaN(newValue)) {
                            toast.error('Discount amount must be a number.')
                            resetToOriginal()
                            return
                        }

                        if (row.original.discountType === 'percentage' && (newValue <= 0 || newValue > 100)) {
                            toast.error('Discount amount must be between 1% and 100%.')
                            resetToOriginal()
                            return
                        }

                        if (newValue <= 0) {
                            toast.error('Discount amount must be greater than 0.')
                            resetToOriginal()
                            return
                        }

                        updateDiscountCode({
                            ...row.original,
                            discountAmount: parseInt(e.target.value),
                        })
                        input.value = renderDiscountAmount(newValue, row.original.discountType)
                    }}
                />
            ),
        },
        {
            id: 'expiryDate',
            header: ({ column }) => {
                return (
                    <div className="text-center">
                        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                            Expiry Date
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                )
            },
            // accessorFn: (row) => DateTime.fromJSDate(row.expiryDate).toFormat('dd/LL/yyyy'),
            cell: ({ row }) => {
                const expiryDate = row.original.expiryDate
                return (
                    <Popover
                        open={calendarsOpen[row.id]}
                        onOpenChange={(open) => setCalendarsOpen((prev) => ({ ...prev, [row.id]: open }))}
                    >
                        <PopoverTrigger asChild>
                            <Button
                                variant={'outline'}
                                className={cn(
                                    'w-[280px] border-none bg-transparent text-center font-normal hover:bg-transparent',
                                    !expiryDate && 'text-muted-foreground'
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {expiryDate ? format(expiryDate, 'PPP') : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={expiryDate}
                                onSelect={(expiryDate) => {
                                    if (expiryDate) {
                                        updateDiscountCode({ ...row.original, expiryDate })
                                        setCalendarsOpen((prev) => ({ ...prev, [row.id]: false }))
                                    }
                                }}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                )
            },
        },
        {
            accessorKey: 'numberOfUsesAllocated',
            header: () => <div className="text-center">Allocations</div>,
            cell: ({ row }) => (
                <Input
                    id={`numberOfUsesAllocated-${row.id}`}
                    className="border-none bg-transparent text-center"
                    defaultValue={row.getValue('numberOfUsesAllocated')}
                    autoComplete="off"
                    onKeyUp={(e) => {
                        if (e.key === 'Enter') {
                            document.getElementById(`numberOfUsesAllocated-${row.id}`)?.blur()
                        }
                    }}
                    onBlur={(e) => {
                        const newValue = parseInt(e.target.value)
                        const input = document.getElementById(`numberOfUsesAllocated-${row.id}`) as HTMLInputElement

                        if (newValue === row.original.numberOfUsesAllocated) {
                            return
                        }

                        if (isNaN(newValue)) {
                            toast.error('Allocation must be a number.')
                            input.value = row.original.numberOfUsesAllocated.toString()
                            return
                        }
                        if (newValue < 0) {
                            toast.error('Allocation must be greater than 0.')
                            input.value = row.original.numberOfUsesAllocated.toString()
                            return
                        }

                        updateDiscountCode({ ...row.original, numberOfUsesAllocated: newValue })
                    }}
                />
            ),
        },
        {
            accessorKey: 'numberOfUses',
            header: () => <div className="text-center">Number of uses</div>,
            cell: ({ row }) => <div className="text-center">{row.getValue('numberOfUses')}</div>,
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                return (
                    <div className="flex justify-center">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => deleteCode(row.original.id)}>Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )
            },
        },
    ]

    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

    const table = useReactTable<DiscountCode>({
        data: data.status === 'loaded' ? data.result : [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        state: {
            sorting,
            columnFilters,
        },
        initialState: {
            pagination: {
                pageSize: 30,
            },
        },
    })

    const [openNewCode, setOpenNewCode] = useState(false)

    return (
        <div className="twp h-full">
            <Toaster richColors />
            <main className="absolute flex h-full w-full justify-center p-4 sm:p-8">
                <div className="w-full max-w-5xl">
                    <h1 className="font-lilita text-3xl">Discount Codes</h1>
                    {data.status === 'loading' && (
                        <>
                            <div className="mb-4 mt-8 flex justify-between">
                                <Skeleton className="h-10 w-full max-w-sm" />
                                <Skeleton className="h-10 w-40" />
                            </div>
                            <Skeleton className="h-[698px]" />
                        </>
                    )}
                    {data.status === 'loaded' && (
                        <>
                            <div className="my-4 mb-4 flex justify-between gap-4 sm:mt-8">
                                <Input
                                    value={(table.getColumn('code')?.getFilterValue() as string) ?? ''}
                                    onChange={(event) => table.getColumn('code')?.setFilterValue(event.target.value)}
                                    className="max-w-sm"
                                    placeholder="Filter discount codes..."
                                />
                                <Button onClick={() => setOpenNewCode(true)}>New Discount Code</Button>
                            </div>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        {table.getHeaderGroups().map((headerGroup) => (
                                            <TableRow key={headerGroup.id}>
                                                {headerGroup.headers.map((header) => {
                                                    return (
                                                        <TableHead key={header.id}>
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
                                                <TableRow key={row.id}>
                                                    {row.getVisibleCells().map((cell) => (
                                                        <TableCell key={cell.id}>
                                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                                    No discount codes.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="flex items-center justify-end space-x-2 py-4">
                                <div className="flex-1 text-sm text-muted-foreground">
                                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                >
                                    Next
                                </Button>
                            </div>
                        </>
                    )}
                    <NewCodeDialog open={openNewCode} close={() => setOpenNewCode(false)} />
                </div>
            </main>
        </div>
    )
}
