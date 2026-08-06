import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { HolidayProgramDiscountWebsiteFormSchema, type WebsiteForm } from '@fizz-kidz/core'

import type { DiscountCode } from '../holiday-program-discount-dialog'

import { Button } from '@/react-ui/button'
import { Checkbox } from '@/react-ui/checkbox'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/react-ui/form'
import { Input } from '@/react-ui/input'
import { Toaster } from '@/react-ui/sonner'
import { submitWebsiteForm } from '@/utils/website-forms'

function HolidayProgramDiscountDialogForm({ onSuccess }: { onSuccess: (data: DiscountCode) => void }) {
    const form = useForm<WebsiteForm['holidayProgramDiscount']>({
        resolver: zodResolver(HolidayProgramDiscountWebsiteFormSchema),
        defaultValues: {
            name: '',
            email: '',
            joinMailingList: true,
        },
    })

    const [loading, setLoading] = useState(false)

    async function onSubmit(values: WebsiteForm['holidayProgramDiscount']) {
        if (loading) return
        setLoading(true)

        try {
            const data = await submitWebsiteForm('holidayProgramDiscount', values)
            onSuccess(data)
        } catch (err) {
            console.error(err)
            toast.error('There was an error getting your discount code.')
            return
        } finally {
            setLoading(false)
        }

        form.reset()
    }

    return (
        <Form {...form}>
            <Toaster richColors closeButton />
            <form onSubmit={form.handleSubmit(onSubmit)} aria-busy={loading}>
                <fieldset disabled={loading} className="contents">
                    <div className="m-auto mt-4 flex w-full min-w-[290px] max-w-3xl flex-col justify-center gap-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormControl>
                                        <Input placeholder="Name" {...field} />
                                    </FormControl>
                                    <FormMessage className="font-extrabold text-pink-600" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormControl>
                                        <Input placeholder="Email" {...field} />
                                    </FormControl>
                                    <FormMessage className="font-extrabold text-pink-600" />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="joinMailingList"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-center space-x-3 space-y-0 rounded-md">
                                    <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel className="font-thin">
                                            Keep me posted with Fizz Kidz news and promotions.
                                        </FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />
                        <Button
                            className="bg-[#9044E2] p-6 font-lilita text-lg hover:bg-[#F6BA33] sm:text-2xl"
                            type="submit"
                            disabled={loading || !form.watch('joinMailingList')}
                        >
                            {loading ? (
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                            ) : (
                                'Yeah! Send me a discount code!'
                            )}
                        </Button>
                    </div>
                </fieldset>
            </form>
        </Form>
    )
}

export default HolidayProgramDiscountDialogForm
