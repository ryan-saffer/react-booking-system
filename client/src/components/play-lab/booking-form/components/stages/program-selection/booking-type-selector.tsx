import { FormField, FormItem, FormLabel } from '@ui-components/form'
import { Table, TableBody, TableCell, TableRow } from '@ui-components/table'
import { cn } from '@utils/tailwind'

import { useCartStore } from '../../../zustand/cart-store'
import { useFormStage } from '../../../zustand/form-stage'
import { useBookingForm } from '../../form-schema'

export function BookingTypeSelector() {
    const form = useBookingForm()
    const { formStage } = useFormStage()
    const clearCart = useCartStore((cart) => cart.clearCart)

    const studio = form.watch('studio')
    const bookingType = form.watch('bookingType')

    function resetFields() {
        form.setValue('appointmentTypeId', null)
    }

    if (formStage !== 'program-selection') return null
    if (!studio) return null

    return (
        <>
            <div className="m-auto my-6 flex flex-col justify-center rounded-sm border bg-slate-50">
                <div className="p-4">
                    <p className="text-center font-lilita text-lg tracking-wide">Play Lab Pricing Structure</p>
                    <p className="text-center text-sm text-muted-foreground">
                        Our sessions are designed to build on your child's skills week to week, with a new engaging
                        experience offered each session!
                    </p>
                </div>
                <Table className="[&_td]:py-2 [&_th]:h-10">
                    <colgroup>
                        <col className="w-1/2" />
                        <col className="w-1/2" />
                    </colgroup>
                    <TableBody className="border-t">
                        <TableRow>
                            <TableCell className="border-r text-right">1 session</TableCell>
                            <TableCell>$35</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="border-r text-right">2 or more sessions</TableCell>
                            <TableCell>5% discount</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="border-r text-right">4 or more sessions</TableCell>
                            <TableCell>10% discount</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="border-r text-right">6 or more sessions</TableCell>
                            <TableCell>20% discount</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
            <FormField
                control={form.control}
                name="bookingType"
                render={({ field }) => (
                    <FormItem className="mb-4 space-y-4">
                        <FormLabel className="text-md">How would you like to book?</FormLabel>
                        <div className="flex flex-col gap-2">
                            <div
                                className={cn('cursor-pointer rounded-md border px-3 py-2 text-sm hover:bg-gray-50', {
                                    'bg-gray-100 hover:bg-gray-100': bookingType === 'term-booking',
                                })}
                                onClick={() => {
                                    if (bookingType !== 'term-booking') {
                                        field.onChange('term-booking')
                                        resetFields()
                                        clearCart()
                                    }
                                }}
                            >
                                <p>Term Booking</p>
                                <p className="text-xs text-muted-foreground">
                                    Book into the same day and time, every week over a term.
                                </p>
                            </div>
                            <div
                                className={cn('cursor-pointer rounded-md border px-3 py-2 text-sm hover:bg-gray-50', {
                                    'bg-gray-100 hover:bg-gray-100': bookingType === 'casual',
                                })}
                                onClick={() => {
                                    if (bookingType !== 'casual') {
                                        field.onChange('casual')
                                        resetFields()
                                        clearCart()
                                    }
                                }}
                            >
                                <p>Casual Booking</p>
                                <p className="text-xs text-muted-foreground">Choose only the sessions you want.</p>
                            </div>
                        </div>
                    </FormItem>
                )}
            />
        </>
    )
}
