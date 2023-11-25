import { StripeClient } from '../stripe-client'
import { UpdatePaymentIntentParams } from 'fizz-kidz'
import { throwTrpcError } from '../../../utilities'

export async function updatePaymentIntent(input: UpdatePaymentIntentParams) {
    const programData: { [key: string]: number } = {}
    input.programs.forEach((it) => {
        // slice childName since key must be under 40 chars
        const key = `${it.childName.slice(0, 40 - it.dateTime.length - 3)} - ${it.dateTime}`
        programData[key] = it.amount
    })
    try {
        const stripe = await StripeClient.getInstance()
        await stripe.paymentIntents.update(input.id, {
            amount: input.amount,
            metadata: { ...programData, discount: JSON.stringify(input.discount) },
        })
        return
    } catch (error) {
        throwTrpcError('INTERNAL_SERVER_ERROR', 'failed updating payment intent', error)
    }
}
