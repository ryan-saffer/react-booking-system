import * as functions from 'firebase-functions'
import * as StripeConfig from '../../config/stripe'
import { Metadata } from 'fizz-kidz'
import Stripe from 'stripe'
import { bookHolidayPrograms } from '../../acuity/holidayPrograms'
const stripeConfig =
    JSON.parse(process.env.FIREBASE_CONFIG).projectId === 'bookings-prod'
        ? StripeConfig.PROD_CONFIG
        : StripeConfig.DEV_CONFIG
const stripe = new Stripe(stripeConfig.API_KEY, {
    apiVersion: '2020-08-27', // https://stripe.com/docs/api/versioning
})

const endpointSecret = 'whsec_1dd2cc3d8fa40bb5a5accb299d6860654c6294010ab819b92b072937080d7207'

export const stripeWebhook = functions.region('australia-southeast1').https.onRequest(async (request, response) => {
    let event = request.body as Stripe.Event

    // Get the signature sent by Stripe
    const signature = request.get('stripe-signature')
    console.log(signature)
    if (signature) {
        try {
            event = stripe.webhooks.constructEvent(request.rawBody.toString('utf8'), signature, endpointSecret)
        } catch (err) {
            if (err instanceof Error) {
                console.log(`⚠️  Webhook signature verification failed.`, err.message)
            }
            response.sendStatus(400)
            return
        }
    } else {
        console.log(`⚠️ Webhook rewuest missing 'stripe-signature' in header`)
        response.sendStatus(400)
        return
    }

    switch (event.type) {
        case 'payment_intent.succeeded':
            console.log('payment intent succeeded')
            let paymentIntent = event.data.object as Stripe.PaymentIntent
            let metadata = paymentIntent.metadata as Metadata
            if (metadata.programType === 'holiday_program') {
                console.log('beginning to book holiday programs')
                await bookHolidayPrograms(paymentIntent.id)
            }
            break
        default:
            // Unexpected event type
            console.log(`Unhandled event type ${event.type}.`)
    }

    let object = event.data.object as any
    console.log(object.id)

    response.sendStatus(200)
    return
})
