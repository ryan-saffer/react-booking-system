import { FormField, FormItem, FormLabel } from '@ui-components/form'
import { cn } from '@utils/tailwind'

import { useFormStage } from '../../zustand/form-stage'
import { useBookingForm } from '../form-schema'

export function BookingTypeSelector() {
    const form = useBookingForm()
    const { formStage } = useFormStage()

    const studio = form.watch('studio')
    const bookingType = form.watch('bookingType')

    function resetFields() {
        form.setValue('appointmentTypeId', null)
    }

    if (formStage !== 'program-selection') return null
    if (!studio) return null

    return (
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
                                field.onChange('term-booking')
                                resetFields()
                            }}
                        >
                            Term Booking
                        </div>
                        <div
                            className={cn('cursor-pointer rounded-md border px-3 py-2 text-sm hover:bg-gray-50', {
                                'bg-gray-100 hover:bg-gray-100': bookingType === 'casual',
                            })}
                            onClick={() => {
                                field.onChange('casual')
                                resetFields()
                            }}
                        >
                            Casual Booking
                        </div>
                    </div>
                </FormItem>
            )}
        />
    )
}
