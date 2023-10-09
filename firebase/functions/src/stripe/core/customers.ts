import { StripeClient } from './StripeClient'

export async function getOrCreateCustomer(name: string, email: string, phone: string) {
    // first check if customer already exists
    const stripe = await StripeClient.getInstance()
    const customersResponse = await stripe.customers.list({ email })
    let customer = customersResponse.data[0]
    if (customer) {
        return customer.id
    }

    // otherwise create customer
    customer = await stripe.customers.create({ name, email, phone })
    return customer.id
}
