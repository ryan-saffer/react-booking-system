import { logger } from 'firebase-functions/v2'
import { onRequest } from 'firebase-functions/v2/https'
import { Metadata } from 'fizz-kidz'
import type { Stripe } from 'stripe'

import { bookHolidayPrograms } from '../../holidayPrograms/core/schedule-paid-holiday-programs'
import { env } from '../../init'
import { logError } from '../../utilities'
import { StripeClient } from '../core/StripeClient'

export const stripeWebhook = onRequest(async (request, response) => {
    let event = request.body as Stripe.Event

    // Get the signature sent by Stripe
    const signature = request.get('stripe-signature')
    logger.log(signature)
    if (signature) {
        try {
            const stripe = await StripeClient.getInstance()
            event = stripe.webhooks.constructEvent(
                request.rawBody.toString('utf8'),
                signature,
                env === 'prod' ? process.env.STRIPE_WEBHOOK_SECRET_PROD : process.env.STRIPE_WEBHOOK_SECRET_DEV
            )
        } catch (err) {
            if (err instanceof Error) {
                logger.log(`⚠️  Webhook signature verification failed.`, err.message)
            }
            response.sendStatus(400)
            return
        }
    } else {
        logger.log(`⚠️ Webhook rewuest missing 'stripe-signature' in header`)
        response.sendStatus(400)
        return
    }

    switch (event.type) {
        case 'payment_intent.succeeded': {
            logger.log('payment intent succeeded')
            const paymentIntent = event.data.object as Stripe.PaymentIntent
            const metadata = paymentIntent.metadata as Metadata
            if (metadata.programType === 'holiday_program') {
                logger.log('beginning to book holiday programs')
                try {
                    await bookHolidayPrograms(paymentIntent.id)
                } catch (err) {
                    logError(
                        `there was an error booking in a holiday program with payment intent id: ${paymentIntent.id}`,
                        err
                    )
                }
            }
            break
        }
        default:
            // Unexpected event type
            logger.log(`Unhandled event type ${event.type}.`)
    }

    const object = event.data.object as any
    logger.log(object.id)

    response.sendStatus(200)
    return
})
