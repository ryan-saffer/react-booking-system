import type Stripe from 'stripe'
import { StripeClient } from '../stripe-client'

/**
 * Recursively retrieves an invoices latest invoice until the latest is found
 *
 * @param invoiceId id of the invoice to retrieve
 *
 * @return invoice
 */
export async function retrieveLatestInvoice(invoiceId: string): Promise<Stripe.Invoice> {
    const stripe = await StripeClient.getInstance()
    const invoice = await stripe.invoices.retrieve(invoiceId)
    if (invoice.latest_revision) {
        if (typeof invoice.latest_revision === 'string') {
            return retrieveLatestInvoice(invoice.latest_revision)
        } else {
            return retrieveLatestInvoice(invoice.latest_revision.id!) // we don't use upcoming invoices, so this is safe
        }
    }
    return invoice
}
