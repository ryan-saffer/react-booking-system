import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@ui-components/button'
import { Input } from '@ui-components/input'
import { Label } from '@ui-components/label'
import { trpc } from '@utils/trpc'

import { useCart } from '../../../state/cart-store'
import { useBookingForm } from '../../../state/form-schema'

export function DiscountInput() {
    const form = useBookingForm()
    const applyDiscountCode = useCart((cart) => cart.applyDiscountCode)

    const [discountCode, setDiscountCode] = useState('')
    const [error, setError] = useState<string | null>(null)

    const { mutateAsync: checkDiscountCode, isLoading } = trpc.holidayPrograms.checkDiscountCode.useMutation()

    const validateDiscount = async () => {
        // do not allow the 'allday' discount code
        if (discountCode === 'allday') {
            toast.error("The certificate code 'allday' is invalid")
            return
        }

        try {
            const result = await checkDiscountCode({ code: discountCode })
            if (result === 'not-found') {
                setError(`The discount code '${discountCode}' is invalid.`)
            } else if (result === 'expired') {
                setError(`The discount code '${discountCode}' has expired.`)
            } else if (result === 'exhausted') {
                setError(`The discount code '${discountCode}' has been exhausted.`)
            } else {
                const resultTransformed = { ...result, expiryDate: new Date(result.expiryDate) }
                const { error } = applyDiscountCode(
                    resultTransformed,
                    form.getValues().children.length,
                    form.getValues().bookingType === 'term-booking'
                )
                if (error) {
                    setError(error)
                    return
                }
                setDiscountCode('')
            }
        } catch (err: any) {
            setError(err.message)
        }
    }

    return (
        <div className="mt-4 flex flex-col gap-2">
            <Label htmlFor="discount">Discount Code</Label>
            <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                    id="discount"
                    value={discountCode}
                    onChange={(e) => {
                        setError(null)
                        setDiscountCode(e.target.value)
                    }}
                />
                <Button
                    className="min-w-32"
                    variant={discountCode.length ? 'default' : 'secondary'}
                    disabled={!discountCode.length || isLoading}
                    onClick={validateDiscount}
                >
                    {isLoading ? <Loader2 className="animate-spin" /> : 'Apply discount'}
                </Button>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    )
}
