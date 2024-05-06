import { ROLES, Role, StaffAuthUser } from 'fizz-kidz'
import { ArrowUpDown, Loader2, MoreHorizontal } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { useConfirm } from '@components/Hooks/confirmation-dialog.tsx/use-confirmation-dialog'
import { useAuth } from '@components/Hooks/context/useAuth'
import { useOrg } from '@components/Session/use-org'
import { getRoleDisplayValue } from '@constants/roles'
import {
    Row,
    SortingState,
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table'
import { Button } from '@ui-components/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@ui-components/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui-components/select'
import { Separator } from '@ui-components/separator'
import { Skeleton } from '@ui-components/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ui-components/table'
import { trpc } from '@utils/trpc'

import { NewUserDialog } from './new-user-dialog'

const columnHelper = createColumnHelper<StaffAuthUser>()

export function ManageUsersTable() {
    const { currentOrg, role, hasPermission } = useOrg()
    const authUser = useAuth()
    const { data, isSuccess, isLoading, refetch } = trpc.auth.getUsers.useQuery({ studio: currentOrg })

    const [openNewUserDialog, setOpenNewUserDialog] = useState(false)
    const confirm = useConfirm()

    const updateUserRoleMutation = trpc.auth.updateUserRole.useMutation()
    const removeUserMutation = trpc.auth.removeUserFromStudio.useMutation()

    const [removingUser, setRemovingUser] = useState<string | null>(null)

    const [users, setUsers] = useState<Record<string, StaffAuthUser>>({})
    useEffect(() => {
        if (data) {
            const users: Record<string, StaffAuthUser> = {}
            data.map((user) => (users[user.uid] = user))
            setUsers(users)
        }
    }, [data])

    const updateUser = useCallback(
        async (row: Row<StaffAuthUser>, role: Role) => {
            const prevRoles = users[row.original.uid].roles
            try {
                // optimistic update
                setUsers((prevUsers) => ({
                    ...prevUsers,
                    [row.original.uid]: {
                        ...prevUsers[row.original.uid],
                        roles: { ...prevRoles, [currentOrg!]: role },
                    },
                }))
                await updateUserRoleMutation.mutateAsync({
                    uid: row.original.uid,
                    studio: currentOrg!,
                    role,
                })
                toast.success(`Role for '${row.original.email}' updated.`)
                refetch()
            } catch {
                toast.error(`Unable to update role for '${row.original.email}'`)
                // revert
                setUsers((prevUsers) => ({
                    ...prevUsers,
                    [row.original.uid]: {
                        ...prevUsers[row.original.uid],
                        roles: prevRoles,
                    },
                }))
            }
        },
        [currentOrg, updateUserRoleMutation, users, refetch]
    )

    const removeUser = useCallback(
        async (rowId: string, uid: string, email: string) => {
            setRemovingUser(rowId)
            try {
                await removeUserMutation.mutateAsync({ uid, studio: currentOrg! })
                toast.success(`Removed '${email}' from this studio.`)
                refetch()
            } catch (err) {
                toast.error('An error occured removing the user from this studio.')
            } finally {
                setRemovingUser(null)
            }
        },
        [removeUserMutation, currentOrg, refetch]
    )

    const columns = useMemo(
        () => [
            columnHelper.accessor('firstname', {
                header: ({ column, header }) => (
                    <div style={{ width: `${header.getSize()}px` }}>
                        <Button
                            variant="ghost"
                            onClick={() => {
                                console.log('sorting clicked')
                                column.toggleSorting(column.getIsSorted() === 'asc')
                            }}
                        >
                            Name
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                ),
                cell: ({ row }) => (
                    <div>{`${row.original.firstname || ''} ${row.original.lastname || ''}`.trim() || '-'}</div>
                ),
                sortingFn: (rowA, rowB) => {
                    const firstNameA = rowA.original.firstname || ''
                    const firstNameB = rowB.original.firstname || ''
                    return firstNameA < firstNameB ? -1 : firstNameA > firstNameB ? 1 : 0
                },
            }),
            columnHelper.accessor('email', {
                header: () => <div>Email Address</div>,
            }),
            columnHelper.accessor(`roles.${currentOrg!}`, {
                header: ({ column }) => (
                    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                        Role
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                ),
                cell: ({ row }) => {
                    if (role !== 'admin') {
                        const user = users[row.original.uid]
                        return (
                            <div>
                                {user && user.roles[currentOrg!] && getRoleDisplayValue(user.roles[currentOrg!]!)}
                            </div>
                        )
                    } else {
                        return (
                            <Select
                                value={users[row.original.uid]?.roles[currentOrg!]}
                                onValueChange={async (selectedRole: Role) => {
                                    if (row.original.uid === authUser?.uid) {
                                        const confirmed = await confirm({
                                            title: 'Are you sure?',
                                            description:
                                                'Changing your own role could lose your admin privileges to manage roles. Only do this if you are sure!',
                                        })
                                        if (confirmed) {
                                            updateUser(row, selectedRole)
                                        }
                                    } else {
                                        updateUser(row, selectedRole)
                                    }
                                }}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {ROLES.map((role) => (
                                        <SelectItem key={role} value={role}>
                                            {getRoleDisplayValue(role)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )
                    }
                },
                sortingFn: (a, b) => {
                    const firstRole = a.original.roles[currentOrg!] || ''
                    const secondRole = b.original.roles[currentOrg!] || ''
                    return firstRole < secondRole ? -1 : firstRole > secondRole ? 1 : 0
                },
            }),
            columnHelper.display({
                id: 'actions',
                cell: ({ row }) => (
                    <>
                        {removingUser === row.id ? (
                            <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        ) : (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        onClick={async () => {
                                            if (row.original.uid === authUser?.uid) {
                                                const confirmed = await confirm({
                                                    title: 'Are you sure?',
                                                    description:
                                                        'Removing yourself will mean you will lose access to this studio, as well as the ability to manage the users.',
                                                })

                                                if (confirmed) {
                                                    removeUser(row.id, row.original.uid, row.original.email)
                                                }
                                            } else {
                                                removeUser(row.id, row.original.uid, row.original.email)
                                            }
                                        }}
                                    >
                                        Remove user
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </>
                ),
            }),
        ],
        [authUser?.uid, confirm, currentOrg, removeUser, removingUser, role, updateUser, users]
    )

    const [sorting, setSorting] = useState<SortingState>([])

    const table = useReactTable<StaffAuthUser>({
        data: users && data ? data : [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        state: {
            sorting,
        },
        sortingFns: {
            test: () => {
                console.log('sorting')
                return -1
            },
        },
    })

    return (
        <>
            <section className="h-full w-full">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="font-lilita text-xl">Manage Users</h3>
                        <p className="text-sm text-muted-foreground">
                            This is where you can add users and manage their roles.
                        </p>
                    </div>
                    {hasPermission('admin') && <Button onClick={() => setOpenNewUserDialog(true)}>Add User</Button>}
                </div>
                <Separator className="my-6" />
                {isLoading && <Skeleton className="h-[400px]" />}
                {isSuccess && (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => {
                                            return (
                                                <TableHead
                                                    key={header.id}
                                                    // style={{
                                                    //     width: `${(header.colSpan / headerGroup.headers.length) * 100}%`,
                                                    // }}
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
                                        <TableRow key={row.id} className="h-20">
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
                                            No Employees.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </section>
            <NewUserDialog
                open={openNewUserDialog}
                close={() => {
                    setOpenNewUserDialog(false)
                    refetch()
                }}
            />
        </>
    )
}
