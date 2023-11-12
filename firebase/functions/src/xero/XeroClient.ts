import type { XeroClient as TXeroClient } from 'xero-node'
import { env } from '../init'
import { ClientStatus } from '../utilities/types'

export class XeroClient {
    private static instance: XeroClient
    #status: ClientStatus = 'not-initialised'

    #client: TXeroClient | null = null

    private constructor() {}

    static async getInstance() {
        if (!XeroClient.instance) {
            XeroClient.instance = new XeroClient()
            await XeroClient.instance.#initialise()
        }
        while (XeroClient.instance.#status === 'initialising') {
            await new Promise((resolve) => setTimeout(resolve, 20))
        }
        if (!XeroClient.instance.#client) {
            throw new Error('Xero client not initialised')
        }
        return XeroClient.instance.#client
    }

    async #initialise() {
        this.#status = 'initialising'
        try {
            const { XeroClient: _XeroClient } = await import('xero-node')
            this.#client = new _XeroClient({
                clientId: env === 'prod' ? process.env.XERO_CLIENT_ID : process.env.DEV_XERO_CLIENT_ID,
                clientSecret: env === 'prod' ? process.env.XERO_CLIENT_SECRET : process.env.DEV_XERO_CLIENT_SECRET,
                grantType: 'client_credentials',
            })

            const tokenSet = await this.#client.getClientCredentialsToken()
            this.#client.setTokenSet(tokenSet)
        } catch (err) {
            throw { message: 'error initialising xero api', error: err }
        }
        this.#status = 'initialised'
    }
}
