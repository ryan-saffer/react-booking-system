import type Stripe from 'stripe'
import { getOrCreateCustomer } from '../customers'
import { getStripeClient } from '../StripeClient'

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
    const stripe = await getStripeClient()
    const invoiceItems = await stripe.invoiceItems.create({
        customer,
        description,
        price,
    })

    // 3. create the invoice
    const invoice = await stripe.invoices.create({
        customer,
        description: invoiceItems.description ?? '',
        collection_method: 'send_invoice',
        days_until_due: daysUntilDue,
        metadata,
        pending_invoice_items_behavior: 'include',
    })

    if (!invoice.id) {
        throw new Error('error creating invoice - no id returned')
    }

    await stripe.invoices.sendInvoice(invoice.id)
    return invoice
}
