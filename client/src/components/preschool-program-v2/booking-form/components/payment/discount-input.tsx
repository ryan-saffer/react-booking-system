import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@ui-components/button'
import { Input } from '@ui-components/input'
import { Label } from '@ui-components/label'
import { useTRPC } from '@utils/trpc'

import { useCart } from '../../state/cart-store'
import { useBookingForm } from '../../state/form-schema'

export function DiscountInput() {
    const trpc = useTRPC()
    const form = useBookingForm()
    const applyDiscountCode = useCart((store) => store.applyDiscountCode)
    const [discountCode, setDiscountCode] = useState('')
    const [error, setError] = useState<string | null>(null)

    const { mutateAsync: checkDiscountCode, isPending } = useMutation(
        trpc.holidayPrograms.checkDiscountCode.mutationOptions()
    )

    async function validateDiscount() {
        const code = discountCode.trim()
        if (!code) {
            toast.error('Please enter a discount code')
            return
        }

        try {
            const result = await checkDiscountCode({
                code,
                customerEmail: form.getValues().parentEmailAddress,
            })

            if (result === 'not-found') {
                setError(`The discount code '${code}' is invalid.`)
                return
            }

            if (result === 'expired') {
                setError(`The discount code '${code}' has expired.`)
                return
            }

            if (result === 'exhausted') {
                setError(`The discount code '${code}' has been exhausted.`)
                return
            }

            const { error } = applyDiscountCode({ ...result, expiryDate: new Date(result.expiryDate) })
            if (error) {
                setError(error)
                return
            }

            setDiscountCode('')
            setError(null)
        } catch (err: any) {
            if (err?.data?.code === 'DISCOUNT_CODE_ALREADY_REDEEMED') {
                setError('This discount code has already been redeemed by you')
            } else {
                setError(err.message)
            }
        }
    }

    return (
        <div className="mt-4 flex flex-col gap-2">
            <Label htmlFor="discount-code">Discount Code</Label>
            <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                    id="discount-code"
                    value={discountCode}
                    onChange={(event) => {
                        setError(null)
                        setDiscountCode(event.target.value)
                    }}
                />
                <Button
                    className="min-w-32"
                    variant={discountCode ? 'default' : 'secondary'}
                    disabled={!discountCode || isPending}
                    onClick={validateDiscount}
                    type="button"
                >
                    {isPending ? <Loader2 className="animate-spin" /> : 'Apply discount'}
                </Button>
            </div>
            {error ? <p className="text-sm text-red-500">{error}</p> : null}
        </div>
    )
}
