import { format } from 'date-fns'
import { AlertCircle, CalendarIcon, CircleX, Plus } from 'lucide-react'
import { DateTime } from 'luxon'
import { Fragment, useState } from 'react'
import { useFieldArray } from 'react-hook-form'

import Loader from '@components/Shared/Loader'
import { WaitingListForm } from '@components/after-school-program/in-schools/booking-form/waiting-list-form'
import { DateCalendar } from '@mui/x-date-pickers'
import { Alert, AlertDescription, AlertTitle } from '@ui-components/alert'
import { Button } from '@ui-components/button'
import { Checkbox } from '@ui-components/checkbox'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@ui-components/form'
import { Input } from '@ui-components/input'
import { Popover, PopoverContent, PopoverTrigger } from '@ui-components/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui-components/select'
import { Separator } from '@ui-components/separator'
import { Textarea } from '@ui-components/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@ui-components/tooltip'
import { cn } from '@utils/tailwind'
import { trpc } from '@utils/trpc'

import { FileUploadInput } from './file-upload-input'
import { GRADES, useEnrolmentForm } from './form-schema'
import { useSelectedProgram } from './use-selected-program'
import { getChildNumber } from './utils.booking-form'

export function BookingForm() {
    const form = useEnrolmentForm()

    const {
        fields: children,
        append: appendChild,
        remove: removeChild,
    } = useFieldArray({
        control: form.control,
        name: 'children',
    })

    const {
        fields: pickupPeople,
        append: appendPickupPerson,
        remove: removePickupPerson,
    } = useFieldArray({
        control: form.control,
        name: 'pickupPeople',
    })

    const { selectedProgram } = useSelectedProgram()

    if (!selectedProgram) {
        throw new Error('Unreachable state! `selectedProgram` should always be defined at this point.')
    }

    const {
        isLoading,
        isSuccess,
        isError,
        data: classes,
    } = trpc.acuity.classAvailability.useQuery({
        appointmentTypeId: selectedProgram!.id,
        includeUnavailable: true,
    })

    const [openCalendars, setOpenCalendars] = useState<Record<string, boolean>>({})

    if (isLoading) {
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
                        <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Class Full</AlertTitle>
                            <AlertDescription>Unfortunately this class is full for the term.</AlertDescription>
                        </Alert>
                        <WaitingListForm program={selectedProgram.name} />
                    </>
                )
            }
        }

        const numClasses = classes.length
        return (
            <>
                <h3 className="my-2 text-center text-xl font-semibold">
                    ${parseInt(selectedProgram.price) * numClasses} for {numClasses === 8 ? 'an' : 'a'} {numClasses}{' '}
                    week term
                </h3>
                <SectionBreak title="Parent Details" />
                <FormField
                    control={form.control}
                    name="parentFirstName"
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
                            name={`children.${idx}.grade` as const}
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
                                            Please enter {form.watch('children')[idx].firstName || 'the child'}'s
                                            allergies here
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                        {form.watch('children')[idx].hasAllergies && (
                            <FormField
                                control={form.control}
                                name={`children.${idx}.isAnaphylactic` as const}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Is {form.watch('children')[idx].firstName || 'this child'} anaphylactic?
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
                        {form.watch('children')[idx].isAnaphylactic && (
                            <FormField
                                control={form.control}
                                name={`children.${idx}.anaphylaxisPlan` as const}
                                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                render={({ field: { value, onChange, ...fieldProps } }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Please upload {form.watch('children')[idx].firstName || 'the child'}'s
                                            anaphylaxis plan
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
                            name={`children.${idx}.needsSupport` as const}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Does {form.watch('children')[idx].firstName || 'your child'} need extra support
                                        for learning difficulties, disabilites or additional learning needs?
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
                        {form.watch('children')[idx].needsSupport && (
                            <FormField
                                control={form.control}
                                name={`children.${idx}.support` as const}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            How best can we support{' '}
                                            {form.watch('children')[idx].firstName || 'your child'}?
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
                            name={`children.${idx}.permissionToPhotograph` as const}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        We love to show other parents the cool things that we do by taking pictures and
                                        videos. Do you give permission for{' '}
                                        {form.watch('children')[idx].firstName || 'your child'} to be in our marketing
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
                    type="button"
                    variant="secondary"
                    onClick={() => appendChild({ firstName: '', lastName: '' }, { shouldFocus: true })}
                >
                    Enrol Another Child
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
                <SectionBreak title="Pickup People" />
                <p>Please list here anyone who you give permssion to pickup your child from the program.</p>
                <p>You do not need to list yourself.</p>
                {pickupPeople.map((person, idx) => (
                    <FormField
                        control={form.control}
                        name={`pickupPeople.${idx}.pickupPerson` as const}
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
                    type="button"
                    variant="secondary"
                    onClick={() => appendPickupPerson({ pickupPerson: '' }, { shouldFocus: true })}
                >
                    Add Pickup Person
                    <Plus className="ml-2 h-4 w-4" />
                </Button>
                <FormField
                    control={form.control}
                    name="termsAndConditions"
                    render={({ field }) => (
                        <FormItem className="my-2">
                            <div className="flex items-center space-y-0">
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <FormLabel className="ml-2 cursor-pointer">
                                    I have read and agreed to the terms and conditions.
                                </FormLabel>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />
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
