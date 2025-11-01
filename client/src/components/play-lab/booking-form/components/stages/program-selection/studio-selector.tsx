import type { Studio } from 'fizz-kidz'
import { capitalise } from 'fizz-kidz'

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@ui-components/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui-components/select'

import { useCart } from '../../../state/cart-store'
import { useBookingForm } from '../../../state/form-schema'
import { useFormStage } from '../../../state/form-stage-store'

const SUPPORTED_LOCATIONS: Studio[] = ['essendon', 'kingsville']

export function StudioSelector() {
    const form = useBookingForm()

    const { formStage } = useFormStage()
    const clearCart = useCart((store) => store.clearCart)

    if (formStage !== 'program-selection') return null

    return (
        <FormField
            control={form.control}
            name="studio"
            render={({ field }) => (
                <FormItem className="mb-4 space-y-4">
                    <Select
                        onValueChange={(value) => {
                            field.onChange(value)
                            clearCart()
                        }}
                        defaultValue={field.value ?? undefined}
                    >
                        <FormLabel className="text-md">Which studio would you like to attend?</FormLabel>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a studio" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {import.meta.env.VITE_ENV === 'prod' &&
                                SUPPORTED_LOCATIONS.map((location) => {
                                    return (
                                        <SelectItem key={location} value={location}>
                                            {capitalise(location)}
                                        </SelectItem>
                                    )
                                })}
                            {import.meta.env.VITE_ENV === 'dev' && (
                                <SelectItem value="test" key="test">
                                    Test
                                </SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}
