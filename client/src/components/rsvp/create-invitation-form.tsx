import { format } from 'date-fns'
import type { InvitationsV2 } from 'fizz-kidz'
import { STUDIOS } from 'fizz-kidz'
import { CalendarIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { Button } from '@ui-components/button'
import { Calendar } from '@ui-components/calendar'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@ui-components/form'
import { Input } from '@ui-components/input'
import { Popover, PopoverContent, PopoverTrigger } from '@ui-components/popover'
import { SelectContent, SelectForm, SelectItem, SelectValue } from '@ui-components/select'
import { Switch } from '@ui-components/switch'
import { capitalise } from '@utils/stringUtilities'
import { cn } from '@utils/tailwind'

export function CreateInvitationForm({
    defaultValues,
    onSubmit,
    isLoading,
    submitButton,
    className,
}: {
    defaultValues: Partial<InvitationsV2.Invitation>
    onSubmit: (values: InvitationsV2.Invitation) => void
    isLoading: boolean
    submitButton: ReactNode
    className?: string
}) {
    const form = useForm<InvitationsV2.Invitation>({
        defaultValues,
    })

    useEffect(() => form.setFocus('childName'), [form])

    // used to close calendar popover after date selection
    const [isDateCalendarOpen, setIsDateCalendarOpen] = useState(false)
    const [isRsvpCalendarOpen, setIsRsvpCalendarOpen] = useState(false)

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className={cn('space-y-4', className)}>
                    <FormField
                        control={form.control}
                        rules={{ required: true }}
                        name="childName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Child's Name</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Child's Name"
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
                        name="childAge"
                        rules={{ required: true }}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Child's Age</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="Child's Age"
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
                                                disabled={isLoading}
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
                                    <Input placeholder="Time" autoComplete="off" disabled={isLoading} {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="$type"
                        rules={{ required: true }}
                        render={({ field }) => {
                            return (
                                <FormItem>
                                    <SelectForm
                                        label="Party Location"
                                        onValueChange={field.onChange}
                                        disabled={isLoading}
                                        defaultValue={field.value}
                                    >
                                        <SelectValue placeholder="Select the parties location" />
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
                                    </SelectForm>
                                </FormItem>
                            )
                        }}
                    />
                    {form.watch('$type') === 'studio' && (
                        <FormField
                            control={form.control}
                            name="studio"
                            rules={{ required: true }}
                            render={({ field }) => (
                                <FormItem>
                                    <SelectForm
                                        label="Studio"
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        disabled={isLoading}
                                    >
                                        <SelectValue placeholder="Select a studio" />
                                        <SelectContent
                                            // https://github.com/shadcn-ui/ui/issues/2620#issuecomment-1918404840
                                            ref={(ref) => {
                                                if (!ref) return
                                                ref.ontouchstart = (e) => e.preventDefault()
                                            }}
                                        >
                                            {Object.values(STUDIOS).map((studio) => (
                                                <SelectItem key={studio} value={studio}>
                                                    {capitalise(studio)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </SelectForm>
                                </FormItem>
                            )}
                        />
                    )}
                    {form.watch('$type') === 'mobile' && (
                        <FormField
                            control={form.control}
                            name="address"
                            rules={{ required: true }}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Address"
                                            autoComplete="off"
                                            disabled={isLoading}
                                            {...field}
                                        />
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
                                    <Input placeholder="RSVP Name" autoComplete="off" disabled={isLoading} {...field} />
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
                                                disabled={isLoading}
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
                        name="parentMobile"
                        rules={{ required: true }}
                        render={({ field }) => (
                            <FormItem className="pb-4">
                                <FormLabel>RSVP Mobile Number</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="RSVP Mobile Number"
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
                        name="rsvpNotificationsEnabled"
                        render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-xl border border-dashed border-slate-200 bg-white/70 px-3 py-3">
                                <div>
                                    <FormLabel className="text-sm font-semibold text-slate-800">
                                        Email me when guests RSVP
                                    </FormLabel>
                                    <p className="text-xs text-slate-500">
                                        We'll send updates to you each time a guest replies.
                                    </p>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value ?? true}
                                        onCheckedChange={(checked) => field.onChange(!!checked)}
                                        disabled={isLoading}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
                {submitButton}
            </form>
        </Form>
    )
}
