import type { Role } from 'fizz-kidz'
import { ROLES } from 'fizz-kidz'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { useOrg } from '@components/Session/use-org'
import { getRoleDisplayValue } from '@constants/roles'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@ui-components/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@ui-components/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@ui-components/form'
import { Input } from '@ui-components/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui-components/select'
import { getOrgName } from '@utils/studioUtils'
import { useTRPC } from '@utils/trpc'

import { useMutation } from '@tanstack/react-query'

const formSchema = z.object({
    firstname: z.string().min(1, { message: 'First name cannot be empty.' }),
    lastname: z.string().min(1, { message: 'Last name cannot be empty.' }),
    email: z.string().email({ message: 'Email address is not valid.' }),
    role: z.custom<Role>((value) => !!value, { message: 'Role is required.' }),
})

export function NewUserDialog({ open, close }: { open: boolean; close: () => void }) {
    const trpc = useTRPC()
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstname: '',
            lastname: '',
            email: '',
        },
    })

    const { currentOrg } = useOrg()

    const { mutateAsync: addUser, isPending } = useMutation(trpc.auth.addUserToStudio.mutationOptions())

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const result = await addUser({
                firstname: values.firstname,
                lastname: values.lastname,
                email: values.email,
                role: values.role,
                studio: currentOrg!,
            })

            if (result === 'exists') {
                toast.info(`User '${values.email}' is already a member of ${getOrgName(currentOrg!)}.`)
            } else {
                toast.success(`'${values.email}' added to ${getOrgName(currentOrg!)}.`)
            }
        } catch (err) {
            console.error(err)
            toast.error(`There was an error adding '${values.email}'.`)
        }

        form.reset()
        close()
    }

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent className="twp sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add new user</DialogTitle>
                    <DialogDescription>Add a user to this studio.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form className="grid gap-4 py-4" onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField
                            control={form.control}
                            name="firstname"
                            rules={{ required: true }}
                            render={({ field }) => (
                                <FormItem className="pb-2">
                                    <FormLabel>First name</FormLabel>
                                    <FormControl>
                                        <Input autoComplete="off" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="lastname"
                            rules={{ required: true }}
                            render={({ field }) => (
                                <FormItem className="pb-2">
                                    <FormLabel>Last name</FormLabel>
                                    <FormControl>
                                        <Input autoComplete="off" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            rules={{ required: true }}
                            render={({ field }) => (
                                <FormItem className="pb-2">
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input autoComplete="off" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="role"
                            rules={{ required: true }}
                            render={({ field }) => (
                                <FormItem className="pb-2">
                                    <Select onValueChange={field.onChange}>
                                        <FormLabel>Role</FormLabel>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue defaultValue="Select role" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {ROLES.map((role) => (
                                                <SelectItem key={role} value={role}>
                                                    {getRoleDisplayValue(role)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit">
                                {isPending ? <Loader2 className="animate-spin" /> : 'Save changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
