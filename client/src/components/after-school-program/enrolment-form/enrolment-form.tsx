import { format } from 'date-fns'
import { AlertCircle, CalendarIcon, CircleX, Loader2, Plus } from 'lucide-react'
import type { DateTime } from 'luxon'
import { Fragment, useEffect, useState } from 'react'
import { useFieldArray, useWatch } from 'react-hook-form'

import Loader from '@components/Shared/Loader'
import TermsAndConditions from '@components/after-school-program/enrolment-form/terms-and-conditions'
import { DateCalendar } from '@mui/x-date-pickers'
import { Alert, AlertDescription, AlertTitle } from '@ui-components/alert'
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
import { useTRPC } from '@utils/trpc'

import { FileUploadInput } from './file-upload-input'
import { GRADES, useEnrolmentForm } from './form-schema'
import { useSelectedProgram } from './use-selected-program'
import { getChildNumber } from './utils.booking-form'
import { WaitingListForm } from './waiting-list-form'

import { useQuery } from '@tanstack/react-query'

export function EnrolmentForm({ submitting }: { submitting: boolean }) {
    const trpc = useTRPC()
    const form = useEnrolmentForm()

    const {
        fields: children,
        append: appendChild,
        remove: removeChild,
    } = useFieldArray({
        control: form.control,
        name: 'main.children',
    })

    const {
        fields: pickupPeople,
        append: appendPickupPerson,
        remove: removePickupPerson,
    } = useFieldArray({
        control: form.control,
        name: 'main.pickupPeople',
    })

    const { selectedProgram } = useSelectedProgram()

    if (!selectedProgram) {
        throw new Error('Unreachable state! `selectedProgram` should always be defined at this point.')
    }

    const {
        isPending,
        isSuccess,
        isError,
        data: classes,
    } = useQuery(
        trpc.acuity.classAvailability.queryOptions({
            appointmentTypeIds: [selectedProgram!.id],
            includeUnavailable: true,
        })
    )

    const watchedChildren = useWatch({ control: form.control, name: 'main.children' })

    function formatCurrency(amount: number) {
        return amount % 1 === 0 ? `$${amount}` : `$${amount.toFixed(2)}`
    }

    /**
     * Sync the required 'main' or 'waitingList' section with if the class is full.
     */
    useEffect(() => {
        const isFull = (classes && classes.length > 0 && classes[0].slotsAvailable === 0) || false
        form.setValue('classIsFull', isFull)

        if (isFull) {
            form.setValue('main', undefined)
        } else {
            form.setValue('waitingList', undefined)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSuccess])

    // needed to close date picker when date is chosen
    const [openCalendars, setOpenCalendars] = useState<Record<string, boolean>>({})
    const [showTermsAndConditions, setShowTermsAndConditions] = useState(false)

    if (isPending) {
        return <Loader />
    }

    if (isError) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    There was an error while fetching the classes. Please try again later.
                </AlertDescription>
            </Alert>
        )
    }

    if (isSuccess) {
        if (classes.length > 0) {
            if (classes[0].slotsAvailable === 0) {
                return (
                    <>
                        <Separator className="my-4" />
                        <Alert variant="info">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle className="font-semibold">Class Full</AlertTitle>
                            <AlertDescription className="font-medium">
                                Unfortunately this class is full for the term.
                            </AlertDescription>
                        </Alert>
                        <WaitingListForm submitting={submitting} />
                    </>
                )
            }
        }

        const numClasses = classes.length
        return (
            <>
                <h3 className="my-2 text-center text-xl font-semibold">
                    {formatCurrency(parseFloat(selectedProgram.price) * numClasses)} for {numClasses === 8 ? 'an' : 'a'}{' '}
                    {numClasses} week term
                </h3>
                <p className="text-center italic">No credit card details are required to enrol.</p>
                <p className="mb-4 text-center italic">
                    We will only invoice you after your free trial, if you choose to continue.
                </p>
                <p className="text-sm">
                    Our free trial is designed for families genuinely interested in enrolling in our After School
                    Program. Please only book if you're available to attend and have no other time commitments. We
                    kindly ask that you only register if you're considering joining the full-term program, as spaces are
                    limited. Thank you! 😊
                </p>
                <SectionBreak title="Parent Details" />
                <FormField
                    control={form.control}
                    name="main.parentFirstName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Parent First Name</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="main.parentLastName"
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
                    name="main.parentEmailAddress"
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
                    name="main.parentPhone"
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
                            name={`main.children.${idx}.firstName` as const}
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
                            name={`main.children.${idx}.lastName` as const}
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
                            name={`main.children.${idx}.dob` as const}
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
                            name={`main.children.${idx}.grade` as const}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Child Grade</FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a grade" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {GRADES.map((grade) => (
                                                    <SelectItem key={grade} value={grade}>
                                                        {grade}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`main.children.${idx}.hasAllergies` as const}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Does {watchedChildren?.[idx].firstName || 'this child'} have any allergies?
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
                        {watchedChildren?.[idx].hasAllergies && (
                            <FormField
                                control={form.control}
                                name={`main.children.${idx}.allergies` as const}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Please enter {watchedChildren?.[idx].firstName || 'the child'}'s allergies
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
                        {watchedChildren?.[idx].hasAllergies && (
                            <FormField
                                control={form.control}
                                name={`main.children.${idx}.isAnaphylactic` as const}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Is {watchedChildren?.[idx].firstName || 'this child'} anaphylactic?
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
                        )}
                        {watchedChildren?.[idx].isAnaphylactic && (
                            <FormField
                                control={form.control}
                                name={`main.children.${idx}.anaphylaxisPlan` as const}
                                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                render={({ field: { value, onChange, ...fieldProps } }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Please upload {watchedChildren?.[idx].firstName || 'the child'}
                                            's anaphylaxis plan
                                        </FormLabel>
                                        <FormControl>
                                            <FileUploadInput
                                                {...fieldProps}
                                                onSuccess={(file) => {
                                                    console.log('FILED CHANGED')
                                                    console.log(file.name)
                                                    onChange(file)
                                                }}
                                                accept=".pdf"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                        <FormField
                            control={form.control}
                            name={`main.children.${idx}.needsSupport` as const}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Does {watchedChildren?.[idx].firstName || 'your child'} need extra support for
                                        learning difficulties, disabilites or additional learning needs?
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
                        {watchedChildren?.[idx].needsSupport && (
                            <FormField
                                control={form.control}
                                name={`main.children.${idx}.support` as const}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            How best can we support {watchedChildren?.[idx].firstName || 'your child'}?
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                        <FormField
                            control={form.control}
                            name={`main.children.${idx}.permissionToPhotograph` as const}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        We love to show other parents the cool things that we do by taking pictures and
                                        videos. Do you give permission for{' '}
                                        {watchedChildren?.[idx].firstName || 'your child'} to be in our marketing
                                        content?
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
                                                <SelectItem value="yes">Yes - I give permission</SelectItem>
                                                <SelectItem value="no">No - I don't give permission</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </Fragment>
                ))}
                <Button
                    className="border-2 border-dashed bg-slate-50"
                    type="button"
                    variant="outline"
                    onClick={() => appendChild({ firstName: '', lastName: '' } as any, { shouldFocus: true })}
                >
                    {form.getValues('main.children')?.length === 0 ? 'Add Child' : 'Enrol Another Child'}
                    <Plus className="ml-2 h-4 w-4" />
                </Button>
                <SectionBreak title="Emergency Contact" />
                <p>This person will be contacted in the case we cannot get hold of you.</p>
                <FormField
                    control={form.control}
                    name="main.emergencyContactName"
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
                    name="main.emergencyContactRelation"
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
                    name="main.emergencyContactNumber"
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
                <SectionBreak title="Pickup People" />
                <p>Please list here anyone who you give permssion to pickup your child from the program.</p>
                <p>You do not need to list yourself.</p>
                {pickupPeople.map((person, idx) => (
                    <FormField
                        control={form.control}
                        name={`main.pickupPeople.${idx}.pickupPerson` as const}
                        key={person.id}
                        render={({ field }) => (
                            <FormItem className="grow">
                                <FormLabel>Name and relation to child</FormLabel>
                                <FormControl>
                                    <div className="flex gap-3">
                                        <Input {...field} placeholder='Example: "Harry - Dad"' />
                                        <TooltipProvider delayDuration={150}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        type="button"
                                                        onClick={() => removePickupPerson(idx)}
                                                    >
                                                        <CircleX className="h-4 w-4" color="#E16A92" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Remove pickup person</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                ))}
                <Button
                    className="border-2 border-dashed bg-slate-50"
                    type="button"
                    variant="outline"
                    onClick={() => appendPickupPerson({ pickupPerson: '' }, { shouldFocus: true })}
                >
                    Add Pickup Person
                    <Plus className="ml-2 h-4 w-4" />
                </Button>
                <FormField
                    control={form.control}
                    name="main.termsAndConditions"
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
                    name="main.joinMailingList"
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

                <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-400  font-semibold"
                >
                    {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Enrol'}
                </Button>
                <Dialog open={showTermsAndConditions} onOpenChange={() => setShowTermsAndConditions(false)}>
                    <DialogContent className="twp">
                        <DialogHeader>
                            <DialogTitle>Terms and Conditions</DialogTitle>
                        </DialogHeader>
                        <TermsAndConditions />
                    </DialogContent>
                </Dialog>
            </>
        )
    }
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
