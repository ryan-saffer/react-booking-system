import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { useTRPC } from '@integrations/trpc'
import { Button } from '@shared/components/ui/button'
import { Input } from '@shared/components/ui/input'
import { Label } from '@shared/components/ui/label'

import { useCart } from '../../state/cart-store'

export function GiftCardInput() {
    const trpc = useTRPC()
    const applyGiftCard = useCart((store) => store.applyGiftCard)
    const [giftCardNumber, setGiftCardNumber] = useState('')
    const [error, setError] = useState('')

    const { mutateAsync: checkGiftCardBalance, isPending } = useMutation({
        ...trpc.preschoolProgramV2.checkGiftCardBalance.mutationOptions(),
        onError: (error) => {
            if (error.data?.code === 'GIFT_CARD_NOT_FOUND') {
                setError('Gift card not found.')
            } else {
                setError(error.message)
            }
        },
    })

    async function validateGiftCard() {
        const cleanedNumber = giftCardNumber.replace(/[\s-]/g, '')
        if (!cleanedNumber) {
            toast.error('Please enter a gift card number')
            return
        }

        const result = await checkGiftCardBalance({ giftCardNumber })
        applyGiftCard({
            id: result.giftCardId,
            balanceAppliedCents: 0,
            balanceRemainingCents: result.balanceCents,
            state: result.state,
            last4: result.last4,
        })
        setGiftCardNumber('')
        setError('')
    }

    return (
        <div className="mt-4 flex flex-col gap-2">
            <Label htmlFor="gift-card">
                <p>Gift Card</p>
                <p className="mt-1 text-xs">Have a Fizz Kidz physical or e-gift card? Redeem it here.</p>
            </Label>
            <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                    id="gift-card"
                    value={giftCardNumber}
                    onChange={(event) => setGiftCardNumber(event.target.value)}
                />
                <Button
                    className="min-w-32"
                    variant={giftCardNumber ? 'default' : 'secondary'}
                    disabled={!giftCardNumber || isPending}
                    onClick={validateGiftCard}
                    type="button"
                >
                    {isPending ? <Loader2 className="animate-spin" /> : 'Apply gift card'}
                </Button>
            </div>
            {error ? <p className="text-sm text-red-500">{error}</p> : null}
        </div>
    )
}
