import { FormField, FormItem, FormLabel } from '@ui-components/form'
import { cn } from '@utils/tailwind'

import { useCartStore } from '../../../zustand/cart-store'
import { useFormStage } from '../../../zustand/form-stage'
import { useBookingForm } from '../../form-schema'
import { PricingStructure } from './pricing-structure'

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
            <PricingStructure />
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
                                <p>Term 2 Enrolment</p>
                                <p className="text-sm text-muted-foreground">
                                    Book into the same day and time, every week over a term.
                                </p>
                                <p className="text-sm italic text-muted-foreground">Begins week of May 15th</p>
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
                                <p className="text-sm text-muted-foreground">Choose only the sessions you want.</p>
                            </div>
                        </div>
                    </FormItem>
                )}
            />
        </>
    )
}
