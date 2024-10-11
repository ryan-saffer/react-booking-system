import { format } from 'date-fns'
import { InvitationsV2 } from 'fizz-kidz'
import { CalendarIcon, CircleX, Plus } from 'lucide-react'
import { DateTime } from 'luxon'
import { Fragment, useState } from 'react'
import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'

import Loader from '@components/Shared/Loader'
import { getChildNumber } from '@components/after-school-program/enrolment-form/utils.booking-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { DateCalendar } from '@mui/x-date-pickers'
import { Button } from '@ui-components/button'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@ui-components/form'
import { Input } from '@ui-components/input'
import { Popover, PopoverContent, PopoverTrigger } from '@ui-components/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui-components/select'
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
                hasAllergies: z
                    .boolean()
                    .optional()
                    .refine((val) => val !== undefined, 'Select if the child has any allergies.'),
                allergies: z.string().optional(),
            })
            // only require `allergies` if `hasAllergies` is true
            .refine(
                (data) => {
                    if (data.hasAllergies && !data.allergies) {
                        return false
                    }
                    return true
                },
                {
                    message: `Please enter the child's allergies`,
                    path: ['allergies'],
                }
            )
    ),
    message: z.string().trim().optional(),
})

export function RsvpForm({ invitation }: { invitation: InvitationsV2.Invitation }) {
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
                    hasAllergies: undefined,
                    allergies: '',
                },
            ],
            message: '',
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

    const { isLoading, mutateAsync: sendRsvp } = trpc.parties.rsvp.useMutation()
    // needed to close date picker when date is chosen
    const [openCalendars, setOpenCalendars] = useState<Record<string, boolean>>({})

    const onSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (values, event) => {
        const rsvp = (event?.nativeEvent as any).submitter.value as 'attending' | 'not-attending'
        console.log(rsvp)
        console.log(values)
        await sendRsvp({ ...values, rsvp })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                <SectionBreak title="Parent Details" />
                <FormField
                    control={form.control}
                    name="parentName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Parent Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Parent's Name" autoComplete="off" disabled={isLoading} {...field} />
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
                                <Input
                                    placeholder="Parent's Email"
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
                    name="parentMobile"
                    render={({ field }) => (
                        <FormItem className="pb-2">
                            <FormLabel>Parent Mobile</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Parent's Mobile"
                                    autoComplete="off"
                                    disabled={isLoading}
                                    {...field}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <SectionBreak title="Children Details" />
                {children.map((child, idx) => (
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
                                                        setOpenCalendars((prev) => ({ ...prev, [child.id]: false }))
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
                            name={`children.${idx}.hasAllergies` as const}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Does {form.watch('children')[idx].name || 'this child'} have any allergies?
                                    </FormLabel>
                                    <FormControl>
                                        <Select
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
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Please select" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="yes">Yes</SelectItem>
                                                <SelectItem value="no">No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        {form.watch('children')[idx].hasAllergies && (
                            <FormField
                                control={form.control}
                                name={`children.${idx}.allergies` as const}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Please enter {form.watch('children')[idx].name || 'the child'}'s allergies
                                            here
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea disabled={isLoading} {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        )}
                    </Fragment>
                ))}
                <Button
                    className="w-full border-2 border-dashed bg-slate-50"
                    type="button"
                    variant="outline"
                    onClick={() => appendChild({ firstName: '', lastName: '' } as any, { shouldFocus: true })}
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
                <div className={cn('flex w-full flex-col items-stretch justify-center gap-4', { 'py-4': isLoading })}>
                    {isLoading ? (
                        <Loader />
                    ) : (
                        <>
                            <Button
                                className="rounded-2xl bg-[#02D7F7] font-extrabold uppercase text-black hover:bg-[#02D7F7]/90"
                                type="submit"
                                value="attending"
                            >
                                Attending
                            </Button>
                            <Button
                                className="rounded-2xl bg-[#FFDC5D] font-extrabold uppercase text-black hover:bg-[#FFDC5D]/90"
                                type="submit"
                                value="not-attending"
                            >
                                Can't make it
                            </Button>
                        </>
                    )}
                </div>
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
