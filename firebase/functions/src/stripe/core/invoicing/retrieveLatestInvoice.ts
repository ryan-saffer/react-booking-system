import Stripe from 'stripe'
import { stripe } from '../../../init'

/**
 * Recursively retrieves an invoices latest invoice until the latest is found
 *
 * @param invoiceId id of the invoice to retrieve
 *
 * @return invoice
 */
export async function retrieveLatestInvoice(invoiceId: string): Promise<Stripe.Invoice> {
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
