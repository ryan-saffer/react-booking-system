import { zodResolver } from '@hookform/resolvers/zod'
import { CircleCheckBig, LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import '@/styles/sonner.css'
import { FORM_WEBHOOK } from '@/utils/constants'
import { assertNoCorsRequestSucceeded } from '@/utils/no-cors-response'

import { Button } from '../ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { SelectContent, SelectForm, SelectItem, SelectValue } from '../ui/select'
import { Toaster } from '../ui/sonner'
import { Textarea } from '../ui/textarea'

const formSchema = z.object({
    name: z.string().min(1, 'Contact name is required'),
    email: z.string().min(1, 'Email address is required').email(),
    contactNumber: z.string().min(10, 'Contact number must be at least 10 digits long'),
    organisation: z.string().min(1, 'Organisation name is required'),
    preferredDateAndTime: z.string().min(1, 'Please enter your preffered dates'),
    numberOfAttendees: z.string().trim().min(1, 'Please enter the estimated number of attendees'),
    budget: z.string().optional(),
    enquiry: z.string().min(1, 'Please enter an enquiry'),
    reference: z.enum(['google', 'instagram', 'word-of-mouth', 'attended-fizz', 'other']).optional(),
})

function ActivationsForm() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            email: '',
            contactNumber: '',
            organisation: '',
            preferredDateAndTime: '',
            numberOfAttendees: '',
            budget: '',
            enquiry: '',
            reference: undefined,
        },
    })

    const [loading, setLoading] = useState(false)

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (loading) return
        setLoading(true)

        try {
            const response = await fetch(`${FORM_WEBHOOK}?formId=event`, {
                body: JSON.stringify(values),
                method: 'POST',
                mode: 'no-cors',
            })
            assertNoCorsRequestSucceeded(response)
            window.dataLayer = window.dataLayer || []
            window.dataLayer.push({
                event: 'lead_submit',
            })
        } catch (err) {
            console.error(err)
            toast.error(
                "There was an error submitting the form. Please send us an email at 'bookings@fizzkidz.com.au'."
            )
            return
        } finally {
            setLoading(false)
        }

        form.reset()

        toast.success(
            <div className="flex gap-4">
                <CircleCheckBig className="mt-1 h-4 w-4" />
                <div>
                    <p className="font-semibold">Enquiry recieved!</p>
                    <p>We aim to get back to every enquiry within the same business day. 😄</p>
                </div>
            </div>,
            {
                duration: 15_000,
            }
        )
    }

    return (
        <Form {...form}>
            <Toaster richColors closeButton />
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" aria-busy={loading}>
                <fieldset disabled={loading} className="contents">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Your name *</FormLabel>
                                <FormControl>
                                    <Input
                                        className="rounded-xl border-violet-500 focus-visible:outline-purple-700"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Your email *</FormLabel>
                                <FormControl>
                                    <Input
                                        className="rounded-xl border-violet-500 focus-visible:outline-purple-700"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="contactNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Your best contact number *</FormLabel>
                                <FormControl>
                                    <Input
                                        className="rounded-xl border-violet-500 focus-visible:outline-purple-700"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="organisation"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name of organisation *</FormLabel>
                                <FormControl>
                                    <Input
                                        className="rounded-xl border-violet-500 focus-visible:outline-purple-700"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="preferredDateAndTime"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Preferred date and time *</FormLabel>
                                <FormControl>
                                    <Input
                                        className="rounded-xl border-violet-500 focus-visible:outline-purple-700"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="numberOfAttendees"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Estimated number of attendees *</FormLabel>
                                <FormControl>
                                    <Input
                                        className="rounded-xl border-violet-500 focus-visible:outline-purple-700"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="enquiry"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Your enquiry *</FormLabel>
                                <FormControl>
                                    <Textarea
                                        className="rounded-xl border-violet-500 focus-visible:outline-purple-700"
                                        rows={5}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="budget"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Budget</FormLabel>
                                <FormControl>
                                    <Input
                                        className="rounded-xl border-violet-500 focus-visible:outline-purple-700"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="reference"
                        render={({ field }) => (
                            <FormItem>
                                <SelectForm
                                    label="How did you hear about us?"
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <SelectValue />
                                    <SelectContent>
                                        <SelectItem value="google">Google Search</SelectItem>
                                        <SelectItem value="instagram">Instagram</SelectItem>
                                        <SelectItem value="word-of-mouth">Word of mouth</SelectItem>
                                        <SelectItem value="attended-fizz">Attended a Fizz Kidz experience</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </SelectForm>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button
                        className="!mt-8 w-full rounded-full bg-[#9044E2] hover:bg-[#a56ae6] focus-visible:outline-purple-500"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : 'Submit'}
                    </Button>
                </fieldset>
            </form>
        </Form>
    )
}

export default ActivationsForm
