import { format } from 'date-fns'
import { CalendarIcon, CircleX, Plus } from 'lucide-react'
import type { DateTime } from 'luxon'
import { Fragment, useState } from 'react'
import { useFieldArray } from 'react-hook-form'

import TermsAndConditions from '@components/after-school-program/enrolment-form/terms-and-conditions'
import { getChildNumber } from '@components/after-school-program/enrolment-form/utils.booking-form'
import { DateCalendar } from '@mui/x-date-pickers'
import { Button } from '@ui-components/button'
import { Checkbox } from '@ui-components/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@ui-components/dialog'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@ui-components/form'
import { Input } from '@ui-components/input'
import { Popover, PopoverContent, PopoverTrigger } from '@ui-components/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui-components/select'
import { Separator } from '@ui-components/separator'
import { Textarea } from '@ui-components/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@ui-components/tooltip'
import { cn } from '@utils/tailwind'

import { useCartStore } from '../../zustand/cart-store'
import { useFormStage } from '../../zustand/form-stage'
import { useBookingForm } from '../form-schema'

export function CustomerDetails() {
    const form = useBookingForm()
    const { formStage, nextStage } = useFormStage()

    const calculateTotal = useCartStore((store) => store.calculateTotal)

    const {
        fields: children,
        append,
        remove,
    } = useFieldArray({
        control: form.control,
        name: 'children',
    })

    function appendChild() {
        append({ firstName: '', lastName: '' } as any, { shouldFocus: true })
        calculateTotal(form.getValues().children.length)
    }

    function removeChild(idx: number) {
        remove(idx)
        calculateTotal(form.getValues().children.length)
    }

    // const {
    //     fields: pickupPeople,
    //     append: appendPickupPerson,
    //     remove: removePickupPerson,
    // } = useFieldArray({
    //     control: form.control,
    //     name: 'pickupPeople',
    // })

    // needed to close date picker when date is chosen
    const [openCalendars, setOpenCalendars] = useState<Record<string, boolean>>({})
    const [showTermsAndConditions, setShowTermsAndConditions] = useState(false)

    if (formStage !== 'form') return null

    return (
        <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(nextStage)}>
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
            {children.map((child, idx) => (
                <Fragment key={child.id}>
                    {children.length > 1 && (
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-medium">{getChildNumber(idx + 1)}</h3>
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
                                <FormLabel>Date of birth</FormLabel>
                                <Popover
                                    open={openCalendars[child.id]}
                                    onOpenChange={(open) => setOpenCalendars((prev) => ({ ...prev, [child.id]: open }))}
                                >
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={'outline'}
                                                className={cn(
                                                    'w-[240px] pl-3 text-left font-normal',
                                                    !field.value && 'text-muted-foreground'
                                                )}
                                            >
                                                {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
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
                                    Does {form.watch('children')[idx].firstName || 'this child'} have any allergies?
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
                                <FormMessage />
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
                                        Please enter {form.watch('children')[idx].firstName || 'the child'}'s allergies
                                        here
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                </Fragment>
            ))}
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
            <p>This person will be contacted in the case we cannot get hold of you.</p>
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
                    <FormItem className="mt-2">
                        <div className="flex items-center space-y-0">
                            <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="ml-2 cursor-pointer">
                                I have read and agreed to the{' '}
                                <span
                                    className="text-blue-500 hover:underline"
                                    onClick={() => setShowTermsAndConditions(true)}
                                >
                                    Terms and Conditions.
                                </span>
                            </FormLabel>
                        </div>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="joinMailingList"
                render={({ field }) => (
                    <FormItem className="mb-2">
                        <div className="flex items-center space-y-0">
                            <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="ml-2 cursor-pointer">
                                Keep me informed about the latest Fizz Kidz programs and offers.
                            </FormLabel>
                        </div>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <Button type="submit" className="font-semibold">
                Continue to payment
            </Button>
            <Dialog open={showTermsAndConditions} onOpenChange={() => setShowTermsAndConditions(false)}>
                <DialogContent className="twp">
                    <DialogHeader>
                        <DialogTitle>Terms and Conditions</DialogTitle>
                    </DialogHeader>
                    <TermsAndConditions />
                </DialogContent>
            </Dialog>
        </form>
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
