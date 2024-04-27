import { ROLES, Role } from 'fizz-kidz'
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
import { trpc } from '@utils/trpc'

type Form = {
    email: string
    role: Role
}

const formSchema = z.object({
    email: z.string().email({ message: 'Email address is not valid.' }),
    role: z.custom<Role>((value) => !!value, { message: 'Role is required.' }),
})

export function NewUserDialog({ open, close }: { open: boolean; close: () => void }) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
        },
    })

    const { currentOrg } = useOrg()

    const { mutateAsync: addUser, isLoading } = trpc.auth.addUserToStudio.useMutation()

    const onSubmit = async (values: Form) => {
        try {
            const result = await addUser({
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
                                {isLoading ? <Loader2 className="animate-spin" /> : 'Save changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
