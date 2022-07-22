import * as functions from 'firebase-functions'
import * as StripeConfig from '../../config/stripe'
import { CreatePaymentIntentParams, UpdatePaymentIntentParams } from 'fizz-kidz'
import Stripe from 'stripe'
import { getOrCreateCustomer } from '../core/customers'
import { onCall } from '../../utilities'
const stripeConfig =
    JSON.parse(process.env.FIREBASE_CONFIG).projectId === 'bookings-prod'
        ? StripeConfig.PROD_CONFIG
        : StripeConfig.DEV_CONFIG
const stripe = new Stripe(stripeConfig.API_KEY, {
    apiVersion: '2020-08-27', // https://stripe.com/docs/api/versioning
})

export const createPaymentIntent = onCall<'createPaymentIntent'>(
    async (data: CreatePaymentIntentParams, _context: functions.https.CallableContext) => {
        // first create the customer
        let customerId = await getOrCreateCustomer(data.name, data.email, data.phone)

        let programData: { [key: string]: number } = {}
        data.programs.forEach((it) => {
            programData[it.description] = it.amount
        })
        const paymentIntent = await stripe.paymentIntents.create({
            customer: customerId,
            amount: data.amount,
            currency: 'aud',
            payment_method_types: ['card'],
            description: data.description + ' - ' + data.programs.map((it) => it.description).join(', '),
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

export const updatePaymentIntent = onCall<'updatePaymentIntent'>(
    async (data: UpdatePaymentIntentParams, _context: functions.https.CallableContext) => {
        let programData: { [key: string]: number } = {}
        data.programs.forEach((it) => {
            programData[it.description] = it.amount
        })
        try {
            await stripe.paymentIntents.update(data.id, {
                amount: data.amount,
                metadata: { ...programData, discount: JSON.stringify(data.discount) },
            })
            return
        } catch (error) {
            throw new functions.https.HttpsError('aborted', 'failed updating payment intent', error)
        }
    }
)