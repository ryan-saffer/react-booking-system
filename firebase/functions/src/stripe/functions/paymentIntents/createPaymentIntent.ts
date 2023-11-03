import { getOrCreateCustomer } from '../../core/customers'
import { logError, onCall, throwError } from '../../../utilities'
import { StripeClient } from '../../core/StripeClient'

export const createPaymentIntent = onCall<'createPaymentIntent'>(async (data) => {
    // first create the customer
    const customerId = await getOrCreateCustomer(data.name, data.email, data.phone)

    const programData: { [key: string]: number } = {}
    data.programs.forEach((it) => {
        // slice childName since key must be under 40 chars
        const key = `${it.childName.slice(0, 40 - it.dateTime.length - 3)} - ${it.dateTime}`
        programData[key] = it.amount
    })

    const stripe = await StripeClient.getInstance()
    const description =
        data.description + ' - ' + data.programs.map((it) => `${it.childName} - ${it.dateTime}`).join(', ')
    const paymentIntent = await stripe.paymentIntents.create({
        customer: customerId,
        amount: data.amount,
        currency: 'aud',
        payment_method_types: ['card'],
        description: description.slice(0, 1000), // stripe accepts at most 1000 chars - happens on many (many) bookings at once
        metadata: {
            programType: data.programType,
            programCount: data.programs.length,
            discount: null,
            ...programData,
        },
    })

    if (paymentIntent.client_secret) {
        return {
            id: paymentIntent.id,
            clientSecret: paymentIntent.client_secret,
        }
    } else {
        logError('payment intent failed to create with secret', null, { input: data })
        throwError('aborted', 'payment intent failed to create with secret')
    }
})
