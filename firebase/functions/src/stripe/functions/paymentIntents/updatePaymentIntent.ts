import * as StripeConfig from '../../../config/stripe'
import { UpdatePaymentIntentParams } from 'fizz-kidz'
import Stripe from 'stripe'
import { logError, onCall, throwError } from '../../../utilities'
const stripeConfig =
    JSON.parse(process.env.FIREBASE_CONFIG).projectId === 'bookings-prod'
        ? StripeConfig.PROD_CONFIG
        : StripeConfig.DEV_CONFIG
const stripe = new Stripe(stripeConfig.API_KEY, {
    apiVersion: '2022-08-01', // https://stripe.com/docs/api/versioning
})

export const updatePaymentIntent = onCall<'updatePaymentIntent'>(async (data: UpdatePaymentIntentParams) => {
    const programData: { [key: string]: number } = {}
    data.programs.forEach((it) => {
        // slice childName since key must be under 40 chars
        const key = `${it.childName.slice(0, 40 - it.dateTime.length - 3)} - ${it.dateTime}`
        programData[key] = it.amount
    })
    try {
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
