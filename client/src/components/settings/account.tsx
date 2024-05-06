import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { useAuth } from '@components/Hooks/context/useAuth'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@ui-components/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@ui-components/form'
import { Input } from '@ui-components/input'
import { Separator } from '@ui-components/separator'
import { trpc } from '@utils/trpc'

const FormSchema = z.object({
    firstname: z.string().min(3, { message: 'First name must be at least 3 characters long.' }),
    lastname: z.string().min(3, { message: 'Last name must be at least 3 characters long.' }),
})

export function Account() {
    const user = useAuth()

    const { mutateAsync: updateUser, isLoading } = trpc.auth.updateProfile.useMutation()

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            firstname: user?.firstname || '',
            lastname: user?.lastname || '',
        },
    })

    async function onSubmit(data: z.infer<typeof FormSchema>) {
        try {
            await updateUser(data)
            toast.success('Account updated.')
        } catch (err) {
            toast.error('Unable to update profile.')
        }
    }

    return (
        <section className="max-w-2xl">
            <h2 className="font-lilita text-xl">Account Settings</h2>
            <p className="text-sm text-muted-foreground">This is where you can update your profile settings.</p>
            <Separator className="my-6" />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="firstname"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="lastname"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className="mt-4 w-32">
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update account'}
                    </Button>
                </form>
            </Form>
        </section>
    )
}
