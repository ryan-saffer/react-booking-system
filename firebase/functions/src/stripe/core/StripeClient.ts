import * as StripeConfig from '../../config/stripe'
import { Stripe } from 'stripe'
import { env } from '../../init'

let stripe: Stripe

export function getStripeClient() {
    if (stripe) return stripe
    const stripeConfig = env === 'prod' ? StripeConfig.PROD_CONFIG : StripeConfig.DEV_CONFIG
    stripe = new Stripe(stripeConfig.API_KEY, {
        apiVersion: '2022-08-01', // https://stripe.com/docs/api/versioning
    })
    return stripe
}
