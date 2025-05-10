import { FormField, FormItem, FormLabel } from '@ui-components/form'
import { cn } from '@utils/tailwind'

import { useCartStore } from '../../../zustand/cart-store'
import { useFormStage } from '../../../zustand/form-stage'
import { useBookingForm, type PlayLabBookingForm } from '../../form-schema'
import { PricingStructure } from './pricing-structure'
import { Button } from '@ui-components/button'

export function BookingTypeSelector() {
    const form = useBookingForm()
    const formStage = useFormStage((store) => store.formStage)
    const clearCart = useCartStore((cart) => cart.clearCart)

    const studio = form.watch('studio')
    const bookingType = form.watch('bookingType')

    function handleSelection(type: PlayLabBookingForm['bookingType']) {
        if (bookingType !== type) {
            form.setValue('bookingType', type)
            form.setValue('appointmentTypeId', null)
            clearCart()
        }
    }

    if (formStage !== 'program-selection') return null
    if (!studio) return null

    return (
        <>
            <PricingStructure />
            <FormField
                control={form.control}
                name="bookingType"
                render={() => (
                    <FormItem className="mb-4 space-y-4">
                        <FormLabel className="text-md">How would you like to book?</FormLabel>
                        <div className="flex flex-col gap-2">
                            <Button
                                variant="outline"
                                className={cn('flex flex-col items-start space-y-1 text-left hover:bg-gray-50', {
                                    'bg-gray-100 hover:bg-gray-100': bookingType === 'term-booking',
                                })}
                                onClick={() => handleSelection('term-booking')}
                            >
                                <span className="text-sm">
                                    Term Enrolment - <span className="font-normal italic">20% discount</span>
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    Book for a term to build skills, make friends and save!
                                </span>
                            </Button>
                            <Button
                                variant="outline"
                                className={cn('flex flex-col items-start space-y-1 text-left hover:bg-gray-50', {
                                    'bg-gray-100 hover:bg-gray-100': bookingType === 'casual',
                                })}
                                onClick={() => handleSelection('casual')}
                            >
                                <span className="text-sm">Casual Booking</span>
                                <span className="text-sm text-muted-foreground">
                                    Choose the sessions that work best for you
                                </span>
                            </Button>
                        </div>
                    </FormItem>
                )}
            />
        </>
    )
}
