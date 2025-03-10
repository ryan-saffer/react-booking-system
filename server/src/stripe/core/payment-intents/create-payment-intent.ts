import { CreatePaymentIntentParams } from 'fizz-kidz'

import { MixpanelClient } from '../../../mixpanel/mixpanel-client'
import { throwTrpcError } from '../../../utilities'
import { getOrCreateCustomer } from '../customers'
import { StripeClient } from '../stripe-client'

export async function createPaymentIntent(input: CreatePaymentIntentParams) {
    // first create the customer
    const customerId = await getOrCreateCustomer(input.name, input.email, input.phone)

    const programData: { [key: string]: number } = {}
    input.programs.forEach((it) => {
        // slice childName since key must be under 40 chars
        const key = `${it.childName.slice(0, 40 - it.dateTime.length - 3)} - ${it.dateTime}`
        programData[key] = it.amount
    })

    const stripe = await StripeClient.getInstance()
    const description =
        input.description + ' - ' + input.programs.map((it) => `${it.childName} - ${it.dateTime}`).join(', ')
    const paymentIntent = await stripe.paymentIntents.create({
        customer: customerId,
        amount: input.amount,
        currency: 'aud',
        payment_method_types: ['card'],
        description: description.slice(0, 1000), // stripe accepts at most 1000 chars - happens on many (many) bookings at once
        metadata: {
            programType: input.programType,
            programCount: input.programs.length,
            discount: null,
            ...programData,
        },
    })

    if (paymentIntent.client_secret) {
        // analytics
        const mixpanel = await MixpanelClient.getInstance()
        await mixpanel.track('holiday-program-checkout-reached', {
            distinct_id: input.email,
        })

        return {
            id: paymentIntent.id,
            clientSecret: paymentIntent.client_secret,
        }
    } else {
        throwTrpcError('UNPROCESSABLE_CONTENT', 'payment intent failed to create with secret')
    }
}
