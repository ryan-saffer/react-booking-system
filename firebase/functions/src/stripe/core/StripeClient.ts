import * as StripeConfig from '../../config/stripe'
import type { Stripe as TStripe } from 'stripe'
import { env } from '../../init'

let stripe: TStripe

export async function getStripeClient() {
    if (stripe) return stripe
    const { Stripe } = await import('stripe')
    const stripeConfig = env === 'prod' ? StripeConfig.PROD_CONFIG : StripeConfig.DEV_CONFIG
    stripe = new Stripe(stripeConfig.API_KEY, {
        apiVersion: '2022-08-01', // https://stripe.com/docs/api/versioning
    })
    return stripe
}
