import { format } from 'date-fns'
import { DiscountCode, Service, WithoutId } from 'fizz-kidz'
import { ArrowUpDown, CalendarIcon, DollarSign, Loader2, MoreHorizontal, Percent } from 'lucide-react'
import { DateTime } from 'luxon'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, ScrollRestoration } from 'react-router-dom'
import { Toaster, toast } from 'sonner'

import useFirebase from '@components/Hooks/context/UseFirebase'
import { LANDING } from '@constants/routes'
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@ui-components/dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@ui-components/dropdown-menu'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@ui-components/form'
import { Input } from '@ui-components/input'
import { Popover, PopoverContent, PopoverTrigger } from '@ui-components/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui-components/select'
import { Skeleton } from '@ui-components/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ui-components/table'
import { timestampConverter } from '@utils/firebase/converters'
import { cn } from '@utils/tailwind'
import { trpc } from '@utils/trpc'

export const DiscountCodesPage = () => {
    const firebase = useFirebase()
    const [data, setData] = useState<Service<DiscountCode[]>>({ status: 'loading' })

    useEffect(() => {
        const unsubscribe = firebase.db
            .collection('discountCodes')
            .withConverter(timestampConverter)
            .onSnapshot((codes) =>
                setData({ status: 'loaded', result: codes.docs.map((it) => it.data() as DiscountCode) })
            )
        return () => unsubscribe()
    }, [firebase])

    const deleteCode = useCallback(
        async (id: string) => {
            try {
                await firebase.db.collection('discountCodes').doc(id).delete()
                toast.success('Discount code deleted.')
            } catch (err) {
                console.error(err)
                toast.error('An error occured deleting discount code.')
            }
        },
        [firebase]
    )

    const columns = useMemo<ColumnDef<DiscountCode>[]>(
        () => [
            {
                accessorKey: 'code',
                header: ({ column }) => {
                    return (
                        <div className="text-center">
                            <Button
                                variant="ghost"
                                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                            >
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
                accessorFn: (row) =>
                    row.discountType === 'percentage' ? `${row.discountAmount}%` : `$${row.discountAmount}`,
                cell: ({ row }) => <div className="text-center">{row.getValue('discountAmount')}</div>,
            },
            {
                id: 'expiryDate',
                header: ({ column }) => {
                    return (
                        <div className="text-center">
                            <Button
                                variant="ghost"
                                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                            >
                                Expiry Date
                                <ArrowUpDown className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    )
                },
                accessorFn: (row) => DateTime.fromJSDate(row.expiryDate).toFormat('dd/LL/yyyy'),
                cell: ({ row }) => <div className="text-center">{row.getValue('expiryDate')}</div>,
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
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => deleteCode(row.original.id)}>
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )
                },
            },
        ],
        [deleteCode]
    )

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
            <ScrollRestoration />
            <Navbar />
            <main className="absolute mt-16 flex h-full w-full justify-center p-8">
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
                            <div className="mb-4 mt-8 flex justify-between">
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

function Navbar() {
    return (
        <nav className="absolute flex h-16 w-full items-center justify-center bg-slate-900 shadow-md">
            <Link to={LANDING}>
                <img src="/fizz-logo.png" className="h-12" />
            </Link>
        </nav>
    )
}

type TForm = WithoutId<DiscountCode>
function NewCodeDialog({ open, close }: { open: boolean; close: () => void }) {
    const form = useForm<Omit<TForm, 'discountAmount'> & { discountAmount: number | string }, void, TForm>({
        defaultValues: {
            code: '',
            discountType: undefined,
            discountAmount: '',
            expiryDate: undefined,
        },
    })

    const { mutateAsync: createDiscount, isLoading } = trpc.holidayPrograms.createDiscountCode.useMutation()

    const onSubmit = async (values: TForm) => {
        if (values.discountType === 'percentage' && values.discountAmount > 100) {
            form.setError('discountAmount', { message: 'Percentage discount must be between 0 and 100.' })
            return
        }

        try {
            await createDiscount({
                discountType: values.discountType,
                discountAmount: values.discountAmount,
                code: values.code,
                expiryDate: values.expiryDate,
            })
            toast.success('Discount code created!')
            close()
            form.reset()
        } catch (err) {
            console.error(err)
            toast.error('There was an error creating the discount code.')
        }
    }

    const [isCalendarOpen, setIsCalendarOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent className="twp sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle>Create Discount Code</DialogTitle>
                    <DialogDescription>Create a new discount code to be used for holiday programs.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form className="space-y-2" onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField
                            control={form.control}
                            rules={{ required: true }}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Discount Code</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Discount code" id="code" autoComplete="off" {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="discountType"
                            rules={{ required: true }}
                            render={({ field }) => (
                                <FormItem className="pb-2">
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormLabel>Discount Type</FormLabel>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select discount type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent
                                            // https://github.com/shadcn-ui/ui/issues/2620#issuecomment-1918404840
                                            ref={(ref) => {
                                                if (!ref) return
                                                ref.ontouchstart = (e) => e.preventDefault()
                                            }}
                                        >
                                            <SelectItem value="price">Price</SelectItem>
                                            <SelectItem value="percentage">Percentage</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            rules={{ required: true }}
                            name="discountAmount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Discount Amount</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            {form.watch('discountType') === 'percentage' ? (
                                                <Percent className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                                            ) : (
                                                <DollarSign className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                                            )}
                                            <Input
                                                placeholder="Discount amount"
                                                id="discountAmount"
                                                autoComplete="off"
                                                className="pl-8"
                                                type="number"
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormDescription>
                                        {form.watch('discountType') === 'percentage'
                                            ? 'The percentage off (0-100).'
                                            : 'The amount off in dollars.'}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="expiryDate"
                            rules={{ required: true }}
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Party Date</FormLabel>
                                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={'outline'}
                                                    className={cn(
                                                        'pl-3 text-left font-normal',
                                                        !field.value && 'text-muted-foreground'
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, 'PPP')
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="twp w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={(e) => {
                                                    field.onChange(e)
                                                    setIsCalendarOpen(false)
                                                }}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button className="mt-4" type="submit" disabled={isLoading}>
                                {isLoading ? <Loader2 className="animate-spin" /> : 'Create discount code'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
