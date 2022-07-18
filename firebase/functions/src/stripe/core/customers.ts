import * as StripeConfig from '../../config/stripe'
import Stripe from 'stripe'
const stripeConfig =
    JSON.parse(process.env.FIREBASE_CONFIG).projectId === 'bookings-prod'
        ? StripeConfig.PROD_CONFIG
        : StripeConfig.DEV_CONFIG
const stripe = new Stripe(stripeConfig.API_KEY, {
    apiVersion: '2020-08-27', // https://stripe.com/docs/api/versioning
})

export async function getOrCreateCustomer(name: string, email: string, phone: string) {
    // first check if customer already exists
    let customersResponse = await stripe.customers.list({ email })
    let customer = customersResponse.data[0]
    if (customer) {
        return customer.id
    }

    // otherwise create customer
    customer = await stripe.customers.create({ name, email, phone })
    return customer.id
}