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

const optionalPositiveInteger = z
    .string()
    .trim()
    .refine((value) => value === '' || /^[1-9]\d*$/.test(value), 'Please enter a whole number greater than zero')
    .optional()

const formSchema = z
    .object({
        name: z.string().min(1, 'Contact name is required'),
        email: z.string().min(1, 'Email address is required').email(),
        contactNumber: z.string().min(10, 'Contact number must be at least 10 digits long'),
        service: z
            .enum(['party', 'holiday-program', 'after-school-program', 'incursion', 'activation', 'other'])
            .optional()
            .refine((it) => !!it, {
                message: 'Please select which experience you are interested in',
            }),
        location: z
            .enum(['balwyn', 'cheltenham', 'essendon', 'geelong', 'kingsville', 'malvern', 'at-home', 'other'])
            .optional(),
        suburb: z.string().optional(),
        preferredDateAndTime: z.string().optional(),
        school: z.string().optional(),
        organisation: z.string().optional(),
        module: z
            .enum(['chemicalScience', 'pushAndPull', 'lightAndSound', 'earthWeatherSustainability', 'notSure'])
            .optional(),
        numberOfSessions: optionalPositiveInteger,
        numberOfStudentsPerSession: z.string().trim().optional(),
        numberOfAttendees: z.string().trim().optional(),
        budget: z.string().optional(),
        partyTheme: z
            .enum([
                'glam',
                'fluid-bears',
                'kpop',
                'fairy',
                'safari',
                'science',
                'slime',
                'swiftie',
                'tie-dye',
                'own',
                'mix',
            ])
            .optional(),
        enquiry: z.string().min(1, 'Please enter an enquiry'),
        reference: z.enum(['google', 'instagram', 'word-of-mouth', 'attended-fizz', 'other']).optional(),
        referenceOther: z.string().optional(),
    })
    .superRefine((val, ctx) => {
        if (val.service === 'party' || val.service === 'holiday-program') {
            if (!val.location) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Please choose a location',
                    path: ['location'],
                })
            }
        }
        if (val.service === 'party') {
            if (!val.preferredDateAndTime) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Please enter your preferred date and time',
                    path: ['preferredDateAndTime'],
                })
            }
            if (!val.partyTheme) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Please select your preferred party theme',
                    path: ['partyTheme'],
                })
            }
        }
        if (val.service === 'party' && val.location === 'at-home') {
            if (!val.suburb) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Please enter your suburb',
                    path: ['suburb'],
                })
            }
        }
        if (val.service === 'incursion') {
            if (!val.school) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'School name is required',
                    path: ['school'],
                })
            }
            if (!val.preferredDateAndTime) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Please enter your preferred date and time',
                    path: ['preferredDateAndTime'],
                })
            }
            if (!val.module) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Please select a module',
                    path: ['module'],
                })
            }
            if (!val.numberOfSessions) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Please enter the number of sessions',
                    path: ['numberOfSessions'],
                })
            }
            if (!val.numberOfStudentsPerSession) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Please enter the number of students per session',
                    path: ['numberOfStudentsPerSession'],
                })
            }
        }
        if (val.service === 'activation') {
            if (!val.organisation) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Organisation name is required',
                    path: ['organisation'],
                })
            }
            if (!val.preferredDateAndTime) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Please enter your preferred date and time',
                    path: ['preferredDateAndTime'],
                })
            }
            if (!val.numberOfAttendees) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Please enter the estimated number of attendees',
                    path: ['numberOfAttendees'],
                })
            }
        }
        if (val.service !== 'incursion' && val.service !== 'activation' && !val.reference) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Please select how you heard about us',
                path: ['reference'],
            })
        }
    })

function ContactUsForm() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        shouldUnregister: true,
        defaultValues: {
            name: '',
            email: '',
            contactNumber: '',
            service: undefined,
            location: undefined,
            suburb: '',
            preferredDateAndTime: '',
            school: '',
            organisation: '',
            module: undefined,
            numberOfSessions: '',
            numberOfStudentsPerSession: '',
            numberOfAttendees: '',
            budget: '',
            enquiry: '',
            reference: undefined,
            referenceOther: '',
        },
    })

    const [loading, setLoading] = useState(false)

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (loading) return
        setLoading(true)

        try {
            const response = await fetch(`${FORM_WEBHOOK}?formId=contact`, {
                body: JSON.stringify(values),
                method: 'POST',
                mode: 'no-cors',
            })
            assertNoCorsRequestSucceeded(response)
            window.dataLayer.push({
                event: 'lead_submit',
                studio: values.location,
            })
        } catch (err) {
            console.error({ err })
            toast.error(
                "There was an error submitting the form. Please send us an email at 'bookings@fizzkidz.com.au'."
            )
            return
        } finally {
            setLoading(false)
        }

        form.reset({ service: undefined, location: undefined, suburb: '' })
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
                        name="service"
                        render={({ field }) => (
                            <FormItem>
                                <SelectForm
                                    label="Which Fizz Kidz experience are you interested in?"
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    value={field.value}
                                >
                                    <SelectValue placeholder="Select experience" />
                                    <SelectContent>
                                        <SelectItem value="party">Birthday Party</SelectItem>
                                        <SelectItem value="holiday-program">Holiday Program</SelectItem>
                                        <SelectItem value="after-school-program">After School Program</SelectItem>
                                        <SelectItem value="incursion">School Incursion</SelectItem>
                                        <SelectItem value="activation">Activation and Events</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </SelectForm>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {(form.watch('service') === 'party' || form.watch('service') === 'holiday-program') && (
                        <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                                <FormItem>
                                    <SelectForm
                                        label="Which location are you interested in?"
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <SelectValue />
                                        <SelectContent>
                                            <SelectItem value="balwyn">Balwyn</SelectItem>
                                            <SelectItem value="cheltenham">Cheltenham</SelectItem>
                                            <SelectItem value="essendon">Essendon</SelectItem>
                                            <SelectItem value="geelong">Geelong</SelectItem>
                                            <SelectItem value="kingsville">Kingsville</SelectItem>
                                            <SelectItem value="malvern">Malvern</SelectItem>
                                            <SelectItem value="at-home">At Home</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </SelectForm>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                    {form.watch('service') === 'party' && form.watch('location') === 'at-home' && (
                        <FormField
                            control={form.control}
                            name="suburb"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Which suburb do you live in? *</FormLabel>
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
                    )}
                    {form.watch('service') === 'party' && (
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
                    )}
                    {form.watch('service') === 'incursion' && (
                        <>
                            <FormField
                                control={form.control}
                                name="school"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name of school *</FormLabel>
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
                                name="module"
                                render={({ field }) => (
                                    <FormItem>
                                        <SelectForm
                                            label="Science Module *"
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <SelectValue />
                                            <SelectContent>
                                                <SelectItem value="chemicalScience">Chemical Science</SelectItem>
                                                <SelectItem value="pushAndPull">Push and Pull</SelectItem>
                                                <SelectItem value="lightAndSound">Light and Sound</SelectItem>
                                                <SelectItem value="earthWeatherSustainability">
                                                    Earth, Weather and Sustainability
                                                </SelectItem>
                                                <SelectItem value="notSure">
                                                    A combination of the above / not sure
                                                </SelectItem>
                                            </SelectContent>
                                        </SelectForm>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="numberOfSessions"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Number of sessions *</FormLabel>
                                        <p className="text-sm text-muted-foreground">
                                            Our incursions run for 55 minutes per session.
                                        </p>
                                        <FormControl>
                                            <Input
                                                className="rounded-xl border-violet-500 focus-visible:outline-purple-700"
                                                type="number"
                                                min={1}
                                                step={1}
                                                inputMode="numeric"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="numberOfStudentsPerSession"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Number of students per session *</FormLabel>
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
                        </>
                    )}
                    {form.watch('service') === 'activation' && (
                        <>
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
                        </>
                    )}
                    {form.watch('service') === 'party' && (
                        <FormField
                            control={form.control}
                            name="partyTheme"
                            render={({ field }) => (
                                <FormItem>
                                    <SelectForm
                                        label="Which party theme are you interested in?"
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        value={field.value}
                                    >
                                        <SelectValue />
                                        <SelectContent>
                                            <SelectItem value="glam">Glam Party</SelectItem>
                                            <SelectItem value="fluid-bears">Fluid Bears Party</SelectItem>
                                            <SelectItem value="kpop">Kpop Power Party</SelectItem>
                                            <SelectItem value="fairy">Fairy Party</SelectItem>
                                            <SelectItem value="safari">Jungle Safari Party</SelectItem>
                                            <SelectItem value="science">Science Party</SelectItem>
                                            <SelectItem value="slime">Slime Party</SelectItem>
                                            <SelectItem value="swiftie">Swiftie Party</SelectItem>
                                            <SelectItem value="tie-dye">Tie-Dye Party</SelectItem>
                                            <SelectItem value="own">My own theme</SelectItem>
                                            <SelectItem value="mix">A mix of the above</SelectItem>
                                        </SelectContent>
                                    </SelectForm>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
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
                        name="reference"
                        render={({ field }) => (
                            <FormItem>
                                <SelectForm
                                    label={`How did you hear about us?${
                                        form.watch('service') === 'incursion' || form.watch('service') === 'activation'
                                            ? ''
                                            : ' *'
                                    }`}
                                    onValueChange={field.onChange}
                                    value={field.value}
                                >
                                    <SelectValue />
                                    <SelectContent>
                                        <SelectItem value="google">Google search</SelectItem>
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
                    {form.watch('reference') === 'other' && (
                        <FormField
                            control={form.control}
                            name="referenceOther"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ooh interesting! Please share 🙏</FormLabel>
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
                    )}
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

export default ContactUsForm
