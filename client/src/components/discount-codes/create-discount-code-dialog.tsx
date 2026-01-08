import { format } from 'date-fns'
import type { DiscountCode, WithoutId } from 'fizz-kidz'
import { CalendarIcon, DollarSign, Loader2, Percent } from 'lucide-react'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@ui-components/button'
import { Calendar } from '@ui-components/calendar'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@ui-components/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@ui-components/form'
import { Input } from '@ui-components/input'
import { Popover, PopoverContent, PopoverTrigger } from '@ui-components/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui-components/select'
import { cn } from '@utils/tailwind'
import { useTRPC } from '@utils/trpc'

import { useMutation } from '@tanstack/react-query'

type NumberOrString<T> = {
    [P in keyof T]: T[P] extends number ? T[P] | string : T[P]
}
type TForm = WithoutId<Omit<DiscountCode, 'numberOfUses'>>

export function NewCodeDialog({ open, close }: { open: boolean; close: () => void }) {
    const trpc = useTRPC()
    const form = useForm<NumberOrString<TForm>>({
        defaultValues: {
            code: '',
            discountType: undefined,
            discountAmount: '',
            expiryDate: undefined,
            numberOfUsesAllocated: 1,
        },
    })

    const discountType = useWatch({ control: form.control, name: 'discountType' })

    const { mutateAsync: createDiscount, isPending } = useMutation(
        trpc.holidayPrograms.createDiscountCode.mutationOptions()
    )

    const onSubmit = async (values: NumberOrString<TForm>) => {
        const discountAmount =
            typeof values.discountAmount === 'number' ? values.discountAmount : parseInt(values.discountAmount)
        const numberOfUsesAllocated =
            typeof values.numberOfUsesAllocated === 'number'
                ? values.numberOfUsesAllocated
                : parseInt(values.numberOfUsesAllocated)

        if (values.discountType === 'percentage' && discountAmount > 100) {
            form.setError('discountAmount', { message: 'Percentage discount must be between 0 and 100.' })
            return
        }

        if (discountAmount <= 0) {
            form.setError('discountAmount', { message: 'Discount amount must be greather than 0' })
            return
        }

        if (numberOfUsesAllocated < 0) {
            form.setError('numberOfUsesAllocated', { message: 'Number of uses allocated must be greater than 0.' })
            return
        }

        try {
            await createDiscount({
                discountType: values.discountType,
                discountAmount: discountAmount,
                code: values.code,
                expiryDate: values.expiryDate,
                numberOfUsesAllocated: numberOfUsesAllocated,
            })
            toast.success('Discount code created!')
            close()
            form.reset()
        } catch (err: any) {
            console.error(err)
            if (err?.data?.httpStatus === 412) {
                toast.error(err?.message)
            } else {
                toast.error('There was an error creating the discount code.')
            }
        }
    }

    const [isCalendarOpen, setIsCalendarOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent className="twp sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle>Create Discount Code</DialogTitle>
                    <DialogDescription>Create a new discount code to be used for holiday programs.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form className="space-y-2" onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField
                            control={form.control}
                            rules={{ required: true }}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Discount Code</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Discount code" id="code" autoComplete="off" {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="discountType"
                            rules={{ required: true }}
                            render={({ field }) => (
                                <FormItem className="pb-2">
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormLabel>Discount Type</FormLabel>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select discount type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent
                                            // https://github.com/shadcn-ui/ui/issues/2620#issuecomment-1918404840
                                            ref={(ref) => {
                                                if (!ref) return
                                                ref.ontouchstart = (e) => e.preventDefault()
                                            }}
                                        >
                                            <SelectItem value="price">Price ($)</SelectItem>
                                            <SelectItem value="percentage">Percentage (%)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            rules={{ required: true }}
                            name="discountAmount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Discount Amount</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            {discountType === 'percentage' ? (
                                                <Percent className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                                            ) : (
                                                <DollarSign className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                                            )}
                                            <Input
                                                placeholder="Discount amount"
                                                id="discountAmount"
                                                autoComplete="off"
                                                className="pl-8"
                                                type="number"
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormDescription>
                                        {discountType === 'percentage'
                                            ? 'The percentage off (0-100).'
                                            : 'The amount off in dollars.'}
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="expiryDate"
                            rules={{ required: true }}
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Expiry Date</FormLabel>
                                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={'outline'}
                                                    className={cn(
                                                        'pl-3 text-left font-normal',
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
                                        <PopoverContent className="twp w-auto overflow-hidden p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                captionLayout="dropdown"
                                                onSelect={(e) => {
                                                    field.onChange(e)
                                                    setIsCalendarOpen(false)
                                                }}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            rules={{ required: true }}
                            name="numberOfUsesAllocated"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Number of uses allocated</FormLabel>
                                    <FormControl>
                                        <Input id="numberOfUsesAllocated" autoComplete="off" type="number" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        The number of times this code can be used.
                                        <br />
                                        Booking multiple holiday programs at once only counts as one 'use'.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button className="mt-4 min-w-48" type="submit" disabled={isPending}>
                                {isPending ? <Loader2 className="animate-spin" /> : 'Create discount code'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
