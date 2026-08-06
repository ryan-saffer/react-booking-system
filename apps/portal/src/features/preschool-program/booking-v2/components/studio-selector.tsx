import { capitalise, type StudioOrTest } from '@fizz-kidz/core'

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@shared/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/components/ui/select'

import { useCart } from '../state/cart-store'
import { useBookingForm } from '../state/form-schema'

type StudioSelectorProps = {
    studios: StudioOrTest[]
}

export function StudioSelector({ studios }: StudioSelectorProps) {
    const form = useBookingForm()
    const clearCart = useCart((store) => store.clearCart)

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
                            {studios.map((studio) => (
                                <SelectItem key={studio} value={studio}>
                                    {capitalise(studio)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}
