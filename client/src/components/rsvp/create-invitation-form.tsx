import { format } from 'date-fns'
import { Location } from 'fizz-kidz'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@ui-components/button'
import { Calendar } from '@ui-components/calendar'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@ui-components/form'
import { Input } from '@ui-components/input'
import { Popover, PopoverContent, PopoverTrigger } from '@ui-components/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui-components/select'
import { capitalise } from '@utils/stringUtilities'
import { cn } from '@utils/tailwind'
import { trpc } from '@utils/trpc'

import { INVITATIONS } from './constants/invitations'
import { useInvitationRouterState } from './hooks/use-invitation-router-state'

type TForm = {
    childName: string
    childAge: string
    date: Date
    time: string
    type: 'studio' | 'mobile' | ''
    studio: Location
    address: string
    parentName: string
    parentNumber: string
    rsvpDate: Date
}

export function CreateInvitationForm({
    selectedInvitationIdx,
    onComplete,
}: {
    selectedInvitationIdx: number
    onComplete: (invitationId: string) => void
}) {
    const { isLoading, mutateAsync: generateInvitation } = trpc.parties.generateInvitationV2.useMutation()

    const state = useInvitationRouterState()

    const form = useForm<TForm>({
        defaultValues: {
            childName: state.childName,
            childAge: state.childAge,
            date: state.date,
            time: state.time,
            type: state.type,
            studio: state.studio,
            address: state.address,
            parentName: state.parentName,
            rsvpDate: state.rsvpDate,
            parentNumber: state.parentNumber,
        },
    })

    // used to close calendar popover after date selection
    const [isDateCalendarOpen, setIsDateCalendarOpen] = useState(false)
    const [isRsvpCalendarOpen, setIsRsvpCalendarOpen] = useState(false)

    const onSubmit = async (values: TForm) => {
        try {
            let result = ''
            if (values.type === 'studio') {
                result = await generateInvitation({
                    childName: values.childName,
                    childAge: values.childAge,
                    time: values.time,
                    date: values.date,
                    $type: 'studio',
                    studio: values.studio,
                    rsvpName: values.parentName,
                    rsvpDate: values.rsvpDate,
                    rsvpNumber: values.parentNumber,
                    invitation: INVITATIONS[selectedInvitationIdx].name,
                    bookingId: state!.bookingId!,
                })
            } else if (values.type === 'mobile') {
                result = await generateInvitation({
                    childName: values.childName,
                    childAge: values.childAge,
                    time: values.time,
                    date: values.date,
                    $type: 'mobile',
                    address: values.address,
                    rsvpName: values.parentName,
                    rsvpDate: values.rsvpDate,
                    rsvpNumber: values.parentNumber,
                    invitation: INVITATIONS[selectedInvitationIdx].name,
                    bookingId: state!.bookingId!,
                })
            }

            onComplete(result)
        } catch (err) {
            toast.error('There was an error generating your invitation.')
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="space-y-2 p-4 pb-20">
                    <FormField
                        control={form.control}
                        rules={{ required: true }}
                        name="childName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Child's Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Child's Name" autoComplete="off" {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="childAge"
                        rules={{ required: true }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Child's Age</FormLabel>
                                <FormControl>
                                    <Input placeholder="Child's Age" autoComplete="off" {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="date"
                        rules={{ required: true }}
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Party Date</FormLabel>
                                <Popover open={isDateCalendarOpen} onOpenChange={setIsDateCalendarOpen}>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={'outline'}
                                                className={cn(
                                                    'pl-3 text-left font-normal',
                                                    !field.value && 'text-muted-foreground'
                                                )}
                                            >
                                                {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="twp w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={(e) => {
                                                field.onChange(e)
                                                setIsDateCalendarOpen(false)
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="time"
                        rules={{ required: true }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Time (Ie 10am - 11:30am)</FormLabel>
                                <FormControl>
                                    <Input placeholder="Time" autoComplete="off" {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="type"
                        rules={{ required: true }}
                        render={({ field }) => {
                            return (
                                <FormItem className={form.watch('type') === '' ? 'pb-2' : ''}>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormLabel>Party Location</FormLabel>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select the parties location" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent
                                            // https://github.com/shadcn-ui/ui/issues/2620#issuecomment-1918404840
                                            ref={(ref) => {
                                                if (!ref) return
                                                ref.ontouchstart = (e) => e.preventDefault()
                                            }}
                                        >
                                            <SelectItem value="studio">Fizz Kidz studio</SelectItem>
                                            <SelectItem value="mobile">Mobile Party (at home)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )
                        }}
                    />
                    {form.watch('type') === 'studio' && (
                        <FormField
                            control={form.control}
                            name="studio"
                            rules={{ required: true }}
                            render={({ field }) => (
                                <FormItem>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormLabel>Studio</FormLabel>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a studio" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent
                                            // https://github.com/shadcn-ui/ui/issues/2620#issuecomment-1918404840
                                            ref={(ref) => {
                                                if (!ref) return
                                                ref.ontouchstart = (e) => e.preventDefault()
                                            }}
                                        >
                                            {Object.values(Location).map((location) => (
                                                <SelectItem key={location} value={location}>
                                                    {capitalise(location)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />
                    )}
                    {form.watch('type') === 'mobile' && (
                        <FormField
                            control={form.control}
                            name="address"
                            rules={{ required: true }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Address" autoComplete="off" {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    )}
                    <FormField
                        control={form.control}
                        name="parentName"
                        rules={{ required: true }}
                        render={({ field }) => (
                            <FormItem className="pb-2">
                                <FormLabel>RSVP Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="RSVP Name" autoComplete="off" {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="rsvpDate"
                        rules={{ required: true }}
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>RSVP Date</FormLabel>
                                <Popover open={isRsvpCalendarOpen} onOpenChange={setIsRsvpCalendarOpen}>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={'outline'}
                                                className={cn(
                                                    'pl-3 text-left font-normal',
                                                    !field.value && 'text-muted-foreground'
                                                )}
                                            >
                                                {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="twp w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={(e) => {
                                                field.onChange(e)
                                                setIsRsvpCalendarOpen(false)
                                            }}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="parentNumber"
                        rules={{ required: true }}
                        render={({ field }) => (
                            <FormItem className="pb-4">
                                <FormLabel>RSVP Mobile Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="RSVP Mobile Number" autoComplete="off" {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
                <button
                    type="submit"
                    className="fixed bottom-0 flex h-16 w-full items-center justify-center bg-[#9B3EEA] font-bold text-white"
                    disabled={isLoading}
                >
                    {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Next'}
                </button>
            </form>
        </Form>
    )
}
