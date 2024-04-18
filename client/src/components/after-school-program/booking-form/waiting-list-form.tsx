import { Alert } from 'antd'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@ui-components/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@ui-components/form'
import { Input } from '@ui-components/input'
import { Separator } from '@ui-components/separator'
import { trpc } from '@utils/trpc'

const formSchema = z.object({
    parentName: z.string().min(1, { message: 'Your name is required.' }),
    childName: z.string().min(1, { message: "Child's name is required. " }),
    parentEmail: z.string().email({ message: 'Please enter a valid email.' }),
    parentMobile: z.string().length(10, { message: 'Phone number must be 10 digits' }),
})

export function WaitingListForm({ program }: { program: string }) {
    const { mutateAsync: joinWaitlist, isLoading, isSuccess } = trpc.afterSchoolProgram.joinWaitList.useMutation()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            parentName: '',
            childName: '',
            parentEmail: '',
            parentMobile: '',
        },
    })

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        console.log(values)

        joinWaitlist({ ...values, program })
    }

    return (
        <div className="twp mt-4">
            <Separator className="my-4" />
            <h3 className="mb-2 text-xl font-semibold">Join the wait list</h3>
            <p className="mb-4">If a place becomes available we will contact you straight away!</p>
            {isSuccess ? (
                <Alert
                    type="success"
                    message="Done!"
                    description="You are on the waitlist. We will contact if you a spot opens up."
                />
            ) : (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-2">
                        <FormField
                            control={form.control}
                            name="parentName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Your name</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="childName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Child's name</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="parentEmail"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Your email address</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="parentMobile"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Your phone number</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button className="mt-2 bg-[#A14181]" type="submit">
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Join waitlist'}
                        </Button>
                    </form>
                </Form>
            )}
        </div>
    )
}
