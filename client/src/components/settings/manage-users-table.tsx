import { ROLES, Role, StaffAuthUser } from 'fizz-kidz'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { useConfirm } from '@components/Hooks/confirmation-dialog.tsx/use-confirmation-dialog'
import { useAuth } from '@components/Hooks/context/useAuth'
import { useOrg } from '@components/Session/use-org'
import { getRoleDisplayValue } from '@constants/roles'
import { Row, createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { Button } from '@ui-components/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui-components/select'
import { Skeleton } from '@ui-components/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ui-components/table'
import { trpc } from '@utils/trpc'

import { NewUserDialog } from './new-user-dialog'

const columnHelper = createColumnHelper<StaffAuthUser>()

export function ManageUsersTable() {
    const { currentOrg, role, hasPermission } = useOrg()
    const authUser = useAuth()
    const { data, isSuccess, isLoading, refetch } = trpc.admin.getUsers.useQuery({ studio: currentOrg })

    const [openNewUserDialog, setOpenNewUserDialog] = useState(false)
    const confirm = useConfirm()

    const updateUserRoleMutation = trpc.admin.updateUserRole.useMutation()

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
        [currentOrg, updateUserRoleMutation, users]
    )

    const columns = useMemo(
        () => [
            columnHelper.accessor('email', {
                header: () => <span>Email Address</span>,
            }),
            columnHelper.accessor(`roles.${currentOrg!}`, {
                header: () => <span>Role</span>,
                cell: ({ row }) => {
                    if (role !== 'admin') {
                        const user = users[row.original.uid]
                        return (
                            <span>
                                {user && user.roles[currentOrg!] && getRoleDisplayValue(user.roles[currentOrg!]!)}
                            </span>
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
            }),
        ],
        [authUser?.uid, confirm, currentOrg, role, updateUser, users]
    )

    const table = useReactTable<StaffAuthUser>({
        data: users && data ? data : [],
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <>
            <section className="h-full w-full">
                <div className="mb-6 flex items-end justify-between">
                    <h3 className="font-lilita text-xl">Manage Users</h3>
                    {hasPermission('admin') && <Button onClick={() => setOpenNewUserDialog(true)}>Add User</Button>}
                </div>
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
                                                    style={{
                                                        width: `${(header.colSpan / headerGroup.headers.length) * 100}%`,
                                                    }}
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
