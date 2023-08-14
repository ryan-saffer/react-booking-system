import type { UpdatePaymentIntentParams } from 'fizz-kidz'
import { logError, onCall, throwError } from '../../../utilities'
import { getStripeClient } from '../../core/StripeClient'

export const updatePaymentIntent = onCall<'updatePaymentIntent'>(async (data: UpdatePaymentIntentParams) => {
    const programData: { [key: string]: number } = {}
    data.programs.forEach((it) => {
        // slice childName since key must be under 40 chars
        const key = `${it.childName.slice(0, 40 - it.dateTime.length - 3)} - ${it.dateTime}`
        programData[key] = it.amount
    })
    try {
        const stripe = await getStripeClient()
        await stripe.paymentIntents.update(data.id, {
            amount: data.amount,
            metadata: { ...programData, discount: JSON.stringify(data.discount) },
        })
        return
    } catch (error) {
        logError('failed updating payment intent', error, { input: data })
        throwError('aborted', 'failed updating payment intent', error)
    }
})
