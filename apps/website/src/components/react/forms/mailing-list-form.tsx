import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { MailingListWebsiteFormSchema, type WebsiteForm } from '@fizz-kidz/core'

import { Button } from '../ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { Toaster } from '../ui/sonner'

import { submitWebsiteForm } from '@/utils/website-forms'

function IncursionForm() {
    const form = useForm<WebsiteForm['mailingList']>({
        resolver: zodResolver(MailingListWebsiteFormSchema),
        defaultValues: {
            name: '',
            email: '',
        },
    })

    const [loading, setLoading] = useState(false)

    async function onSubmit(values: WebsiteForm['mailingList']) {
        if (loading) return
        setLoading(true)

        try {
            await submitWebsiteForm('mailingList', values)
        } catch (err) {
            console.error(err)
            toast.error('There was an error joining the mailing list.')
            return
        } finally {
            setLoading(false)
        }

        form.reset()
        toast.success('Done! Keep an eye out for the latest Fizz Kidz news and offers.', {
            duration: 15_000,
        })
    }

    return (
        <Form {...form}>
            <Toaster richColors closeButton />
            <form onSubmit={form.handleSubmit(onSubmit)} aria-busy={loading}>
                <fieldset disabled={loading} className="contents">
                    <div className="m-auto flex w-full max-w-3xl flex-col justify-center gap-8 sm:flex-row">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormLabel className="text-white">Your name *</FormLabel>
                                    <FormControl>
                                        <Input className="rounded-xl border-violet-500" {...field} />
                                    </FormControl>
                                    <FormMessage className="text-red-300" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormLabel className="text-white">Your email *</FormLabel>
                                    <FormControl>
                                        <Input className="rounded-xl border-violet-500" {...field} />
                                    </FormControl>
                                    <FormMessage className="text-red-300" />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="flex justify-center">
                        <Button
                            className="!mt-8 w-80 rounded-full bg-[#4FE16D] text-xl font-extralight text-black hover:bg-[#379d5c]"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : 'Join Mailing List'}
                        </Button>
                    </div>
                </fieldset>
            </form>
        </Form>
    )
}

export default IncursionForm
