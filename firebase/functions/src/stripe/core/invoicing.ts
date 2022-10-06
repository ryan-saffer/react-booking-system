import * as StripeConfig from '../../config/stripe'
import Stripe from 'stripe'
import { getOrCreateCustomer } from './customers'
const stripeConfig =
    JSON.parse(process.env.FIREBASE_CONFIG).projectId === 'bookings-prod'
        ? StripeConfig.PROD_CONFIG
        : StripeConfig.DEV_CONFIG
const stripe = new Stripe(stripeConfig.API_KEY, {
    apiVersion: '2020-08-27', // https://stripe.com/docs/api/versioning
})

export async function sendInvoice(input: {
    firstName: string
    lastName: string
    email: string
    phone: string
    description: string
    price: string
    daysUntilDue?: number
    metadata?: Stripe.Emptyable<Stripe.MetadataParam>
}) {
    const { firstName, lastName, email, phone, description, price, daysUntilDue = 3, metadata } = input
    // 1. get or create customer
    const customer = await getOrCreateCustomer(`${firstName} ${lastName}`, email, phone)

    // 2. create invoice items
    const invoiceItems = await stripe.invoiceItems.create({
        customer,
        description,
        price
    })

    // 3. create the invoice
    const invoice = await stripe.invoices.create({
        customer,
        description: invoiceItems.description ?? '',
        collection_method: 'send_invoice',
        days_until_due: daysUntilDue,
        metadata
    })

    await stripe.invoices.sendInvoice(invoice.id)

    return invoice
}