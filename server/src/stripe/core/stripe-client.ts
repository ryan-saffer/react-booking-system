import * as StripeConfig from '../../config/stripe'
import type { Stripe as TStripe } from 'stripe'
import { env } from '../../init'
import { ClientStatus } from '../../utilities/types'

export class StripeClient {
    private static instance: StripeClient
    #status: ClientStatus = 'not-initialised'

    #client: TStripe | null = null

    private constructor() {}

    static async getInstance() {
        if (!StripeClient.instance) {
            StripeClient.instance = new StripeClient()
            await StripeClient.instance.#initialise()
        }
        while (StripeClient.instance.#status === 'initialising') {
            await new Promise((resolve) => setTimeout(resolve, 20))
        }
        if (!StripeClient.instance.#client) {
            throw new Error('Stripe client not initialised')
        }
        return StripeClient.instance.#client
    }

    async #initialise() {
        this.#status = 'initialising'
        const { Stripe } = await import('stripe')
        const stripeConfig = env === 'prod' ? StripeConfig.PROD_CONFIG : StripeConfig.DEV_CONFIG
        this.#client = new Stripe(stripeConfig.API_KEY, {
            apiVersion: '2022-08-01', // https://stripe.com/docs/api/versioning
        })
        this.#status = 'initialised'
    }
}
