import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { useCart } from '@components/play-lab/booking-form/state/cart-store'
import { useBookingForm } from '@components/play-lab/booking-form/state/form-schema'
import { Button } from '@ui-components/button'
import { Input } from '@ui-components/input'
import { Label } from '@ui-components/label'
import { useTRPC } from '@utils/trpc'

import { useMutation } from '@tanstack/react-query'

export function GiftCardInput() {
    const trpc = useTRPC()
    const form = useBookingForm()
    const applyGiftCard = useCart((store) => store.applyGiftCard)

    const [giftCardNumber, setGiftCardNumber] = useState('')

    const {
        mutateAsync: checkGiftCardBalance,
        isPending,
        error,
    } = useMutation(trpc.playLab.checkGiftCardBalance.mutationOptions())

    async function validateGiftCard() {
        const cleanedNumber = giftCardNumber.replace(/[\s-]/g, '')
        if (!cleanedNumber) {
            toast.error('Please enter a gift card number')
            return
        }

        const result = await checkGiftCardBalance({
            giftCardNumber,
        })
        applyGiftCard(
            {
                id: result.giftCardId,
                balanceAppliedCents: 0,
                balanceRemainingCents: result.balanceCents,
                state: result.state,
                last4: result.last4,
            },
            form.getValues().children.length
        )
        setGiftCardNumber('')
    }
    return (
        <div className="mt-4 flex flex-col gap-2">
            <Label htmlFor="discount">
                <p>Gift Card</p>
                <p className="mt-1 text-xs">Have a Fizz Kidz physical or e-gift card? Redeem it here.</p>
            </Label>
            <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                    id="discount"
                    value={giftCardNumber}
                    onChange={(e) => {
                        // setError(null)
                        setGiftCardNumber(e.target.value)
                    }}
                />
                <Button
                    className="min-w-32"
                    variant={giftCardNumber ? 'default' : 'secondary'}
                    disabled={!giftCardNumber || isPending}
                    onClick={validateGiftCard}
                >
                    {isPending ? <Loader2 className="animate-spin" /> : 'Apply gift card'}
                </Button>
            </div>
            {error && <p className="text-sm text-red-500">{error.message}</p>}
        </div>
    )
}
