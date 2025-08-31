import { SquareClient } from './square-client'

/**
 * Gets the customer id from square given an email address, and if none is found, it will create a customer and return the id.
 */
export async function getOrCreateCustomer(firstName: string, lastName: string, email: string) {
    const square = await SquareClient.getInstance()

    const { customers, errors: searchErrors } = await square.customers.search({
        query: { filter: { emailAddress: { fuzzy: email } } },
    })

    if (searchErrors) throw searchErrors[0]

    const firstCustomer = customers?.[0]
    if (firstCustomer) {
        return firstCustomer.id!
    }

    const { customer, errors: createErrors } = await square.customers.create({
        givenName: firstName,
        familyName: lastName,
        emailAddress: email,
    })

    if (createErrors) throw createErrors[0]

    return customer!.id!
}
