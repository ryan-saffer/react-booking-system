import { format } from 'date-fns'
import type { InvitationsV2 } from 'fizz-kidz'
import { CalendarIcon, CircleX, Loader2, Plus } from 'lucide-react'
import type { DateTime } from 'luxon'
import { Fragment, useEffect, useState } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { getChildNumber } from '@components/after-school-program/enrolment-form/utils.booking-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { DateCalendar } from '@mui/x-date-pickers'
import { Button } from '@ui-components/button'
import { Checkbox } from '@ui-components/checkbox'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@ui-components/form'
import { Input } from '@ui-components/input'
import { Popover, PopoverContent, PopoverTrigger } from '@ui-components/popover'
import { SelectContent, SelectForm, SelectItem, SelectValue } from '@ui-components/select'
import { Separator } from '@ui-components/separator'
import { Textarea } from '@ui-components/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@ui-components/tooltip'
import { cn } from '@utils/tailwind'
import { useTRPC } from '@utils/trpc'

import { useMutation } from '@tanstack/react-query'

const formSchema = z.object({
    parentName: z.string().trim().min(1, { message: 'Please enter your name' }),
    parentEmail: z.string().email({ message: 'Please enter a valid email' }).trim().toLowerCase(),
    parentMobile: z.string().trim().min(10, { message: 'Number must be at least 10 digits' }),
    children: z.array(
        z
            .object({
                name: z.string().trim().min(1, { message: 'Please enter childs name' }),
                dob: z
                    .date()
                    .optional()
                    .refine((date) => !!date, 'Date of birth is required'),
                rsvp: z.enum(['attending', 'not-attending']),
                hasAllergies: z.boolean().optional(),
                allergies: z.string().optional(),
            })
            .superRefine((val, ctx) => {
                if (val.rsvp === 'attending') {
                    if (val.hasAllergies === undefined) {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: `Please select if ${val.name ?? 'this child'} has any allergies`,
                            path: ['hasAllergies'],
                        })
                    }
                    if (val.hasAllergies && val.allergies === '') {
                        ctx.addIssue({
                            code: z.ZodIssueCode.custom,
                            message: `Please enter ${val.name ?? 'this child'}s allergies`,
                            path: ['allergies'],
                        })
                    }
                }
            })
    ),
    message: z.string().trim().optional(),
    joinMailingList: z.boolean(),
})

export function RsvpForm({
    invitation,
    onComplete,
}: {
    invitation: InvitationsV2.Invitation
    onComplete: (status: 'attending' | 'not-attending') => void
}) {
    const trpc = useTRPC()
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            parentName: '',
            parentEmail: '',
            parentMobile: '',
            children: [
                {
                    name: '',
                    dob: undefined,
                    rsvp: undefined,
                    hasAllergies: undefined,
                    allergies: '',
                },
            ],
            message: '',
            joinMailingList: true,
        },
    })

    const {
        fields: children,
        append: appendChild,
        remove: removeChild,
    } = useFieldArray({
        control: form.control,
        name: 'children',
    })

    const watchedChildren = useWatch({ control: form.control, name: 'children' })

    useEffect(() => {
        form.setFocus('parentName')
    }, [form])

    const { isPending, mutateAsync: sendRsvp } = useMutation(trpc.parties.rsvp.mutationOptions())
    // needed to close date picker when date is chosen
    const [openCalendars, setOpenCalendars] = useState<Record<string, boolean>>({})

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            await sendRsvp({ ...values, bookingId: invitation.bookingId, invitationId: invitation.id })
            const hasAttending = values.children.some((child) => child.rsvp === 'attending')
            onComplete(hasAttending ? 'attending' : 'not-attending')
        } catch {
            // TODO - track this error
            toast.error("There was a problem RSVP'ing. Please let the parent know directly if you are able to attend.")
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="space-y-4 pb-4">
                    <SectionBreak title="Parent Details" />
                    <FormField
                        control={form.control}
                        name="parentName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Parent Name</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Parent's Name"
                                        autoComplete="off"
                                        disabled={isPending}
                                        {...field}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="parentEmail"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Parent Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="Parent's Email" disabled={isPending} {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="parentMobile"
                        render={({ field }) => (
                            <FormItem className="pb-2">
                                <FormLabel>Parent Mobile</FormLabel>
                                <FormControl>
                                    <Input placeholder="Parent's Mobile" disabled={isPending} {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <SectionBreak title="Children Details" />
                    {children.map((child, idx) => {
                        const watchChild = watchedChildren[idx]
                        return (
                            <Fragment key={idx}>
                                {children.length > 1 && (
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-medium">{getChildNumber(idx + 1)}</h3>
                                        <TooltipProvider delayDuration={150}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                        type="button"
                                                        onClick={() => removeChild(idx)}
                                                    >
                                                        <CircleX className="h-4 w-4" color="#E16A92" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Remove child</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                )}
                                <FormField
                                    key={child.id}
                                    control={form.control}
                                    name={`children.${idx}.name`}
                                    render={({ field }) => (
                                        <FormItem className="pb-2">
                                            <FormLabel>Child first name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Child's first name"
                                                    autoComplete="off"
                                                    disabled={isPending}
                                                    {...field}
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`children.${idx}.dob` as const}
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Date of birth</FormLabel>
                                            <Popover
                                                open={openCalendars[child.id]}
                                                onOpenChange={(open) =>
                                                    setOpenCalendars((prev) => ({ ...prev, [child.id]: open }))
                                                }
                                            >
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={'outline'}
                                                            className={cn(
                                                                'w-full pl-3 text-left font-normal',
                                                                !field.value && 'text-muted-foreground'
                                                            )}
                                                            disabled={isPending}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, 'PPP')
                                                            ) : (
                                                                <span>Pick a date</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <DateCalendar
                                                        openTo="year"
                                                        onChange={(datetime: DateTime | null, state) => {
                                                            if (datetime && state === 'finish') {
                                                                field.onChange(datetime.toJSDate())
                                                                setOpenCalendars((prev) => ({
                                                                    ...prev,
                                                                    [child.id]: false,
                                                                }))
                                                            }
                                                        }}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`children.${idx}.rsvp` as const}
                                    render={({ field }) => (
                                        <FormItem>
                                            <SelectForm
                                                label={`Will ${watchChild.name || 'this child'} be able to attend?`}
                                                onValueChange={field.onChange}
                                                defaultValue={''}
                                                disabled={isPending}
                                            >
                                                <SelectValue placeholder="Please select" />
                                                <SelectContent>
                                                    <SelectItem value="attending">Will attend</SelectItem>
                                                    <SelectItem value="not-attending">Cannot attend</SelectItem>
                                                </SelectContent>
                                            </SelectForm>
                                        </FormItem>
                                    )}
                                />
                                {watchChild.rsvp === 'attending' && (
                                    <FormField
                                        control={form.control}
                                        name={`children.${idx}.hasAllergies` as const}
                                        render={({ field }) => (
                                            <FormItem>
                                                <SelectForm
                                                    label={`Does ${watchChild.name || 'this child'} have any allergies?`}
                                                    onValueChange={(value) => {
                                                        if (value === 'yes') {
                                                            field.onChange(true)
                                                        }
                                                        if (value === 'no') {
                                                            field.onChange(false)
                                                        }
                                                    }}
                                                    defaultValue={''}
                                                    disabled={isPending}
                                                >
                                                    <SelectValue placeholder="Please select" />
                                                    <SelectContent>
                                                        <SelectItem value="yes">Yes</SelectItem>
                                                        <SelectItem value="no">No</SelectItem>
                                                    </SelectContent>
                                                </SelectForm>
                                            </FormItem>
                                        )}
                                    />
                                )}
                                {watchChild.rsvp === 'attending' && watchChild.hasAllergies && (
                                    <FormField
                                        control={form.control}
                                        name={`children.${idx}.allergies` as const}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Please enter {watchChild.name || 'the child'}'s allergies here
                                                </FormLabel>
                                                <FormDescription>
                                                    This information is for the host's planning. Fizz Kidz doesn't
                                                    monitor these RSVPs - your host will handle any allergy arrangements
                                                    directly.
                                                </FormDescription>
                                                <FormControl>
                                                    <Textarea disabled={isPending} {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </Fragment>
                        )
                    })}
                    <Button
                        className="w-full border-2 border-dashed bg-slate-50"
                        type="button"
                        variant="outline"
                        onClick={() =>
                            appendChild(
                                {
                                    name: '',
                                    dob: undefined,
                                    rsvp: undefined,
                                    hasAllergies: undefined,
                                    allergies: '',
                                } as any,
                                { shouldFocus: true }
                            )
                        }
                        disabled={isPending}
                    >
                        {form.getValues('children').length === 0 ? 'Add Child' : 'Add another invited child'}
                        <Plus className="ml-2 h-4 w-4" />
                    </Button>
                    <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Message</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder={`An optional message to send to ${invitation.childName}'s parents`}
                                        rows={4}
                                        disabled={isPending}
                                        {...field}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="joinMailingList"
                        render={({ field }) => (
                            <FormItem className="py-4">
                                <div className="flex items-center justify-end space-y-0">
                                    <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <FormLabel className="ml-2 cursor-pointer">
                                        Keep me informed about the latest Fizz Kidz programs and offers.
                                    </FormLabel>
                                </div>
                            </FormItem>
                        )}
                    />
                    <p className="text-sm text-muted-foreground">
                        RSVP details are only visible to the party host and Fizz Kidz. Check out our{' '}
                        <a
                            className="font-medium text-[#9B3EEA] underline underline-offset-2 hover:text-[#8B2DE3]"
                            href="https://fizzkidz.com.au/policies#privacy"
                            target="_blank"
                            rel="noreferrer"
                        >
                            privacy policy
                        </a>
                        .
                    </p>
                </div>
                <Button
                    className="w-full rounded-2xl bg-[#9B3EEA] text-base font-semibold text-white shadow-lg transition hover:bg-[#8B2DE3] hover:shadow-xl disabled:opacity-70"
                    type="submit"
                    disabled={isPending}
                >
                    {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Send RSVP'}
                </Button>
            </form>
        </Form>
    )
}

function SectionBreak({ title }: { title: string }) {
    return (
        <div className="flex items-center">
            <Separator className="mr-4 w-fit grow" />
            <h3 className="text-lg font-medium">{title}</h3>
            <Separator className="ml-4 w-fit grow" />
        </div>
    )
}
