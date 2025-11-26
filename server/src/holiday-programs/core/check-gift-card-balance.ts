import { SquareError } from 'square'

import { SquareClient } from '@/square/core/square-client'
import { throwTrpcError } from '@/utilities'

export type CheckGiftCardBalanceResponse = {
    giftCardId: string
    balanceCents: number
    state: 'ACTIVE' | 'DEACTIVATED' | 'BLOCKED' | 'PENDING' | 'UNKNOWN'
    last4: string
}

export async function checkGiftCardBalance(giftCardNumber: string): Promise<CheckGiftCardBalanceResponse> {
    const square = await SquareClient.getInstance()
    const cleanedNumber = giftCardNumber.replace(/[\s-]/g, '')
    const last4 = cleanedNumber.slice(-4)

    try {
        const { giftCard } = await square.giftCards.getFromGan({ gan: cleanedNumber })

        if (!giftCard) {
            throwTrpcError('NOT_FOUND', 'Gift card not found', null, { last4 })
        }

        const currency = giftCard.balanceMoney?.currency
        if (currency && currency !== 'AUD') {
            throwTrpcError('BAD_REQUEST', 'Gift card currency not supported', null, {
                currency,
                last4,
            })
        }

        const balance = giftCard.balanceMoney?.amount ?? BigInt(0)

        return {
            giftCardId: giftCard.id || '',
            balanceCents: Number(balance),
            state: giftCard.state || 'UNKNOWN',
            last4: (giftCard.gan || '').slice(-4),
        }
    } catch (err) {
        if (err instanceof SquareError) {
            const squareError = err.errors[0]
            if (squareError?.code === 'NOT_FOUND') {
                throwTrpcError('NOT_FOUND', 'Gift card not found', err, { last4 })
            }
        }

        throwTrpcError('INTERNAL_SERVER_ERROR', 'Unable to retrieve gift card balance', err, {
            last4,
        })
    }
}
