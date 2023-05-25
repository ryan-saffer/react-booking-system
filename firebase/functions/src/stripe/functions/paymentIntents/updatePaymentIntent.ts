import * as functions from 'firebase-functions'
import * as StripeConfig from '../../../config/stripe'
import { UpdatePaymentIntentParams } from 'fizz-kidz'
import Stripe from 'stripe'
import { onCall } from '../../../utilities'
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
        const key = `${it.childName.slice(0, 15)} - ${it.dateTime}`
        programData[key] = it.amount
    })
    try {
        await stripe.paymentIntents.update(data.id, {
            amount: data.amount,
            metadata: { ...programData, discount: JSON.stringify(data.discount) },
        })
        return
    } catch (error) {
        functions.logger.error('failed updating payment intent', data, error)
        throw new functions.https.HttpsError('aborted', 'failed updating payment intent', error)
    }
})
