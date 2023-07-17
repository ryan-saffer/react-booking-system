import * as functions from 'firebase-functions'
import * as StripeConfig from '../../config/stripe'
import { Metadata } from 'fizz-kidz'
import Stripe from 'stripe'
import { bookHolidayPrograms } from '../../holidayPrograms/core'
const isProd = JSON.parse(process.env.FIREBASE_CONFIG).projectId === 'bookings-prod'
const stripeConfig = isProd ? StripeConfig.PROD_CONFIG : StripeConfig.DEV_CONFIG
const stripe = new Stripe(stripeConfig.API_KEY, {
    apiVersion: '2022-08-01', // https://stripe.com/docs/api/versioning
})

export const stripeWebhook = functions.region('australia-southeast1').https.onRequest(async (request, response) => {
    let event = request.body as Stripe.Event

    // Get the signature sent by Stripe
    const signature = request.get('stripe-signature')
    console.log(signature)
    if (signature) {
        try {
            event = stripe.webhooks.constructEvent(
                request.rawBody.toString('utf8'),
                signature,
                isProd ? process.env.STRIPE_WEBHOOK_SECRET_PROD : process.env.STRIPE_WEBHOOK_SECRET_DEV
            )
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
        case 'payment_intent.succeeded': {
            console.log('payment intent succeeded')
            const paymentIntent = event.data.object as Stripe.PaymentIntent
            const metadata = paymentIntent.metadata as Metadata
            if (metadata.programType === 'holiday_program') {
                console.log('beginning to book holiday programs')
                try {
                    await bookHolidayPrograms(paymentIntent.id)
                } catch (err) {
                    functions.logger.error(
                        `there was an error booking in a holiday program with payment intent id: ${paymentIntent.id}`,
                        { details: err }
                    )
                }
            }
            break
        }
        default:
            // Unexpected event type
            console.log(`Unhandled event type ${event.type}.`)
    }

    const object = event.data.object as any
    console.log(object.id)

    response.sendStatus(200)
    return
})
