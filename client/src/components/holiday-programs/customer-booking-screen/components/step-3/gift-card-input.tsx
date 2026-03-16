import { InfoCircleOutlined } from '@ant-design/icons'
import { useMutation } from '@tanstack/react-query'
import { Button, Input, Popover, Typography } from 'antd'
import { useState } from 'react'
import { toast } from 'sonner'

import { useTRPC } from '@utils/trpc'

import { useCart } from '../../state/cart-store'

export function GiftCardInput({ numberOfKids }: { numberOfKids: number }) {
    const trpc = useTRPC()
    const applyGiftCard = useCart((store) => store.applyGiftCard)
    const clearGiftCard = useCart((store) => store.clearGiftCard)

    const [giftCardNumber, setGiftCardNumber] = useState('')
    const [error, setError] = useState('')

    const { mutateAsync: checkGiftCardBalance, isPending: isCheckingGiftCard } = useMutation({
        ...trpc.holidayPrograms.checkGiftCardBalance.mutationOptions(),
        onError: (error) => {
            if (error.data?.code === 'GIFT_CARD_NOT_FOUND') {
                setError('Gift card not found.')
            } else {
                setError(error.message)
            }
            clearGiftCard(numberOfKids)
        },
    })

    async function handleGiftCardApply() {
        const cleanedNumber = giftCardNumber.replace(/[\s-]/g, '')
        if (!cleanedNumber) {
            toast.error('Please enter a gift card number')
            return
        }

        const result = await checkGiftCardBalance({ giftCardNumber: cleanedNumber })
        applyGiftCard(
            {
                id: result.giftCardId,
                balanceAppliedCents: 0,
                balanceRemainingCents: result.balanceCents,
                state: result.state,
                last4: result.last4,
            },
            numberOfKids
        )
        toast.success(`Gift card ending in ${result.last4} applied.`)
        setGiftCardNumber('')
    }

    return (
        <div style={{ marginBottom: 16 }}>
            <>
                <p className="mb-1 text-muted-foreground">Have a Fizz Kidz physical or e-gift card? Redeem it here.</p>
                <Input.Search
                    style={{ width: '90%' }}
                    value={giftCardNumber}
                    loading={isCheckingGiftCard}
                    enterButton="Apply"
                    onChange={(e) => {
                        setGiftCardNumber(e.target.value)
                        setError('')
                    }}
                    onSearch={handleGiftCardApply}
                    placeholder="Apply Fizz Kidz gift card.."
                />
                <Popover title="Gift Cards" content={<p>Enter the number shown on your physical or e-gift card.</p>}>
                    <Button style={{ width: '10%' }} type="link" icon={<InfoCircleOutlined />} />
                </Popover>
                {error && <Typography.Text type="danger">{error}</Typography.Text>}
            </>
        </div>
    )
}
