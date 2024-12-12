import { format } from 'date-fns'
import { InvitationsV2 } from 'fizz-kidz'
import { CalendarIcon, CircleX, Loader2, Plus } from 'lucide-react'
import { DateTime } from 'luxon'
import { Fragment, useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { getChildNumber } from '@components/after-school-program/enrolment-form/utils.booking-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { DateCalendar } from '@mui/x-date-pickers'
import { Button } from '@ui-components/button'
import { Checkbox } from '@ui-components/checkbox'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@ui-components/form'
import { Input } from '@ui-components/input'
import { Popover, PopoverContent, PopoverTrigger } from '@ui-components/popover'
import { SelectContent, SelectForm, SelectItem, SelectValue } from '@ui-components/select'
import { Separator } from '@ui-components/separator'
import { Textarea } from '@ui-components/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@ui-components/tooltip'
import { cn } from '@utils/tailwind'
import { trpc } from '@utils/trpc'

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

export function RsvpForm({ invitation, onComplete }: { invitation: InvitationsV2.Invitation; onComplete: () => void }) {
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

    useEffect(() => {
        form.setFocus('parentName')
    }, [form])

    const { isLoading, mutateAsync: sendRsvp } = trpc.parties.rsvp.useMutation()
    // needed to close date picker when date is chosen
    const [openCalendars, setOpenCalendars] = useState<Record<string, boolean>>({})

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            await sendRsvp({ ...values, bookingId: invitation.bookingId })
            onComplete()
        } catch {
            // TODO - track this error
            toast.error("There was a problem RSVP'ing. Please let the parent know directly if you are able to attend.")
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="mb-16 space-y-4">
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
                                        disabled={isLoading}
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
                                    <Input placeholder="Parent's Email" disabled={isLoading} {...field} />
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
                                    <Input placeholder="Parent's Mobile" disabled={isLoading} {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <SectionBreak title="Children Details" />
                    {children.map((child, idx) => {
                        const watchChild = form.watch('children')[idx]
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
                                                    disabled={isLoading}
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
                                                            disabled={isLoading}
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
                                                disabled={isLoading}
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
                                                    disabled={isLoading}
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
                                                    Please enter {form.watch('children')[idx].name || 'the child'}'s
                                                    allergies here
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea disabled={isLoading} {...field} />
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
                        disabled={isLoading}
                    >
                        {form.getValues('children').length === 0 ? 'Add Child' : 'Add another child'}
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
                                        disabled={isLoading}
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
                </div>
                <Button
                    variant="blue"
                    className="fixed bottom-0 -ml-4 h-16 w-full rounded-none font-extrabold"
                    type="submit"
                >
                    {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'RSVP'}
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
