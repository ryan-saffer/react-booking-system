import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import {
    CareersFormRoleOptions,
    CareersWebsiteFormSchema,
    WebsiteStudioOptions,
    YesNoOptions,
    type WebsiteForm,
} from '@fizz-kidz/core'

import { Button } from '../ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { SelectContent, SelectForm, SelectItem, SelectValue } from '../ui/select'
import { Toaster } from '../ui/sonner'
import { Textarea } from '../ui/textarea'

import { UploadButton } from '@/utils/uploadthing'
import { submitWebsiteForm } from '@/utils/website-forms'

function CareersForm() {
    const form = useForm<WebsiteForm['careers']>({
        resolver: zodResolver(CareersWebsiteFormSchema),
        defaultValues: {
            name: '',
            email: '',
            contactNumber: '',
            role: undefined,
            wwcc: undefined,
            driversLicense: undefined,
            application: '',
            reference: '',
            resume: undefined,
        },
    })

    const [uploadError, setUploadError] = useState({
        isError: false,
        message: '',
    })

    const [loading, setLoading] = useState(false)

    const handleCustomSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (loading) return
        if (!form.getValues('resume')) {
            setUploadError({
                isError: true,
                message: 'Please upload your resume / CV',
            })
        }
        form.handleSubmit(onSubmit)(e)
    }

    async function onSubmit(values: WebsiteForm['careers']) {
        if (loading) return

        setLoading(true)

        try {
            await submitWebsiteForm('careers', values)
        } catch (err) {
            console.error(err)
            toast.error(
                "There was an error submitting the form. Please send us an email at 'bookings@fizzkidz.com.au'."
            )
            return
        } finally {
            setLoading(false)
        }

        form.reset({
            role: undefined,
            wwcc: undefined,
            driversLicense: undefined,
        })
        form.resetField('resume')
        toast.success(
            'Application recieved! You should have an email with a copy of your submission. We will be in touch soon!',
            {
                duration: 15_000,
            }
        )
    }

    return (
        <Form {...form}>
            <Toaster richColors closeButton />
            <form onSubmit={handleCustomSubmit} className="space-y-4" aria-busy={loading}>
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
                        name="role"
                        render={({ field }) => (
                            <FormItem>
                                <SelectForm
                                    label="Which role are you applying for? *"
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    value={field.value}
                                >
                                    <SelectValue placeholder="Select role" />
                                    <SelectContent>
                                        {CareersFormRoleOptions.map(({ value, label }) => (
                                            <SelectItem key={value} value={value}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </SelectForm>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                            <FormItem>
                                <SelectForm
                                    label="Which location do you want to work at? *"
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    value={field.value}
                                >
                                    <SelectValue placeholder="Select location" />
                                    <SelectContent>
                                        {WebsiteStudioOptions.map(({ value, label }) => (
                                            <SelectItem key={value} value={value}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </SelectForm>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="wwcc"
                        render={({ field }) => (
                            <FormItem>
                                <SelectForm
                                    label="Do you have, or are willing to obtain, a Working With Children's Check? *"
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    value={field.value}
                                >
                                    <SelectValue placeholder="Please answer" />
                                    <SelectContent>
                                        {YesNoOptions.map(({ value, label }) => (
                                            <SelectItem key={value} value={value}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </SelectForm>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="driversLicense"
                        render={({ field }) => (
                            <FormItem>
                                <SelectForm
                                    label="Do you have a drivers license? (Having one is not required!) *"
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    value={field.value}
                                >
                                    <SelectValue placeholder="Please answer" />
                                    <SelectContent>
                                        {YesNoOptions.map(({ value, label }) => (
                                            <SelectItem key={value} value={value}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </SelectForm>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="application"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Let us know why you would like to work at Fizz Kidz *</FormLabel>
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
                    <div>
                        <Label className="font-semibold">Please upload your Resume / CV *</Label>
                        <UploadButton
                            className="mt-2 items-start ut-button:bg-[#9044E2]"
                            disabled={loading}
                            endpoint="resumeUploader"
                            onClientUploadComplete={(res) => {
                                // Do something with the response
                                setUploadError({ isError: false, message: '' })
                                form.setValue(
                                    'resume',
                                    { name: res[0].name, url: res[0].ufsUrl },
                                    { shouldValidate: true }
                                )
                            }}
                            onUploadError={(error: Error) => {
                                // Do something with the error.
                                setUploadError({ isError: true, message: error.message })
                            }}
                        />
                        {uploadError.isError && (
                            <p className="text-sm font-medium text-destructive">{uploadError.message}</p>
                        )}
                        {form.watch('resume') && (
                            <ul className="list-disc pl-4">
                                <li>{form.watch('resume')?.name}</li>
                            </ul>
                        )}
                    </div>
                    <FormField
                        control={form.control}
                        name="reference"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>How did you hear about us? *</FormLabel>
                                <FormControl>
                                    <Textarea
                                        className="rounded-xl border-violet-500 focus-visible:outline-purple-700"
                                        rows={2}
                                        {...field}
                                    />
                                </FormControl>
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

export default CareersForm
