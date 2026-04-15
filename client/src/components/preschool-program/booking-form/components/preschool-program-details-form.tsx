import { DateCalendar } from '@mui/x-date-pickers'
import { format } from 'date-fns'
import { CalendarIcon, CircleX, Loader2, Plus } from 'lucide-react'
import { Fragment, useState } from 'react'
import { useFieldArray, useWatch } from 'react-hook-form'

import { Button } from '@ui-components/button'
import { Checkbox } from '@ui-components/checkbox'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@ui-components/form'
import { Input } from '@ui-components/input'
import { Popover, PopoverContent, PopoverTrigger } from '@ui-components/popover'
import { Textarea } from '@ui-components/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@ui-components/tooltip'
import { cn } from '@utils/tailwind'

import { SectionBreak } from './section-break'
import { usePreschoolProgramForm } from '../state/form-schema'

import type { DateTime } from 'luxon'

type Props = {
    submitting: boolean
}

export function PreschoolProgramDetailsForm({ submitting }: Props) {
    const form = usePreschoolProgramForm()
    const watchedChildren = useWatch({ control: form.control, name: 'children' }) ?? []

    const {
        fields: children,
        append,
        remove,
    } = useFieldArray({
        control: form.control,
        name: 'children',
    })

    const [openCalendars, setOpenCalendars] = useState<Record<string, boolean>>({})

    function appendChild() {
        append(
            {
                firstName: '',
                lastName: '',
                dob: new Date(),
                hasAllergies: false,
                allergies: '',
                additionalInfo: '',
            },
            { shouldFocus: true }
        )
    }

    return (
        <>
            <SectionBreak title="Parent Details" />
            <FormField
                control={form.control}
                name="parentFirstName"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Parent First Name</FormLabel>
                        <FormControl>
                            <Input {...field} autoFocus />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="parentLastName"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Parent Last Name</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="parentEmailAddress"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Parent Email</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="parentPhone"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Parent Phone Number</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <SectionBreak title={`${children.length > 1 ? 'Children' : 'Child'} Details`} />
            {children.map((child, idx) => {
                const watchedChild = watchedChildren[idx] ?? form.getValues(`children.${idx}`)

                return (
                    <Fragment key={child.id}>
                        {children.length > 1 ? (
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-medium">Child {idx + 1}</h3>
                                <TooltipProvider delayDuration={150}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0"
                                                type="button"
                                                onClick={() => remove(idx)}
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
                        ) : null}
                        <FormField
                            control={form.control}
                            name={`children.${idx}.firstName` as const}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Child First Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`children.${idx}.lastName` as const}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Child Last Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`children.${idx}.dob` as const}
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date of Birth</FormLabel>
                                    <Popover
                                        open={openCalendars[child.id]}
                                        onOpenChange={(open) =>
                                            setOpenCalendars((prev) => ({ ...prev, [child.id]: open }))
                                        }
                                    >
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        'w-[240px] pl-3 text-left font-normal',
                                                        !field.value && 'text-muted-foreground'
                                                    )}
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
                                                onChange={(date: DateTime | null, state) => {
                                                    if (date && state === 'finish') {
                                                        field.onChange(date.toJSDate())
                                                        setOpenCalendars((prev) => ({ ...prev, [child.id]: false }))
                                                    }
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`children.${idx}.hasAllergies` as const}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Does {watchedChild?.firstName || 'this child'} have any allergies?
                                    </FormLabel>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant={field.value === true ? 'default' : 'outline'}
                                            onClick={() => field.onChange(true)}
                                        >
                                            Yes
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={field.value === false ? 'default' : 'outline'}
                                            onClick={() => field.onChange(false)}
                                        >
                                            No
                                        </Button>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {watchedChild?.hasAllergies ? (
                            <FormField
                                control={form.control}
                                name={`children.${idx}.allergies` as const}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Allergy Details</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        ) : null}
                        <FormField
                            control={form.control}
                            name={`children.${idx}.additionalInfo` as const}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Additional Information</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            value={field.value || ''}
                                            placeholder="Anything helpful for the team to know about this child"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </Fragment>
                )
            })}

            <Button
                className="border-2 border-dashed bg-slate-50"
                type="button"
                variant="outline"
                onClick={appendChild}
            >
                {form.getValues('children').length === 0 ? 'Add child' : 'Add another child'}
                <Plus className="ml-2 h-4 w-4" />
            </Button>

            <SectionBreak title="Emergency Contact" />
            <p className="text-sm text-slate-600">This person will be contacted if we cannot get hold of you.</p>
            <FormField
                control={form.control}
                name="emergencyContactName"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Emergency Contact Name</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="emergencyContactRelation"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Emergency Contact Relation</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="emergencyContactNumber"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Emergency Contact Number</FormLabel>
                        <FormControl>
                            <Input {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="termsAndConditions"
                render={({ field }) => (
                    <FormItem>
                        <div className="flex items-start space-x-3">
                            <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div className="space-y-1">
                                <FormLabel className="cursor-pointer">
                                    I confirm the information provided is correct and I understand no payment is taken
                                    at enrolment.
                                </FormLabel>
                                <FormMessage />
                            </div>
                        </div>
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="joinMailingList"
                render={({ field }) => (
                    <FormItem>
                        <div className="flex items-start space-x-3">
                            <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="cursor-pointer">
                                Keep me informed about the latest Fizz Kidz programs and offers.
                            </FormLabel>
                        </div>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <Button type="submit" className="font-semibold" disabled={submitting}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Submit Enrolment
            </Button>
        </>
    )
}
