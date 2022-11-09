import * as functions from 'firebase-functions'
import * as StripeConfig from '../../../config/stripe'
import { CreatePaymentIntentParams } from 'fizz-kidz'
import Stripe from 'stripe'
import { getOrCreateCustomer } from '../../core/customers'
import { onCall } from '../../../utilities'
const stripeConfig =
    JSON.parse(process.env.FIREBASE_CONFIG).projectId === 'bookings-prod'
        ? StripeConfig.PROD_CONFIG
        : StripeConfig.DEV_CONFIG
const stripe = new Stripe(stripeConfig.API_KEY, {
    apiVersion: '2022-08-01', // https://stripe.com/docs/api/versioning
})

export const createPaymentIntent = onCall<'createPaymentIntent'>(
    async (data: CreatePaymentIntentParams, _context: functions.https.CallableContext) => {
        // first create the customer
        let customerId = await getOrCreateCustomer(data.name, data.email, data.phone)

        let programData: { [key: string]: number } = {}
        data.programs.forEach((it) => {
            // slice childName since key must be under 40 chars
            const key = `${it.childName.slice(0, 15)} - ${it.dateTime}`
            programData[key] = it.amount
        })
        const paymentIntent = await stripe.paymentIntents.create({
            customer: customerId,
            amount: data.amount,
            currency: 'aud',
            payment_method_types: ['card'],
            description:
                data.description + ' - ' + data.programs.map((it) => `${it.childName} - ${it.dateTime}`).join(', '),
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
            throw new functions.https.HttpsError('aborted', 'payment intent failed to create with secret')
        }
    }
)
