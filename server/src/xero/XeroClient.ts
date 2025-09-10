import type { XeroClient as TXeroClient } from 'xero-node'

import { env } from '../init'
import type { ClientStatus } from '../utilities/types'

export class XeroClient {
    private static instance: XeroClient
    #status: ClientStatus = 'not-initialised'

    #client: TXeroClient | null = null
    #refreshing = false

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
        // Ensure we have a valid token before returning the client
        await XeroClient.instance.#ensureValidToken()
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

    async #ensureValidToken() {
        if (!this.#client) return
        if (this.#refreshing) {
            // If another call is already refreshing, wait briefly
            // to let it complete to avoid duplicate requests.
            let attempts = 0
            while (this.#refreshing && attempts < 50) {
                await new Promise((r) => setTimeout(r, 20))
                attempts++
            }
            return
        }

        try {
            const tokenSet = this.#client.readTokenSet()
            const nowS = Math.floor(Date.now() / 1000)
            const expS = tokenSet.expires_at
            // Refresh a little early to avoid edge races
            const earlyRefreshBufferS = 60
            const isAboutToExpire = expS ? nowS >= expS - earlyRefreshBufferS : false

            if (isAboutToExpire || tokenSet.expired()) {
                this.#refreshing = true
                try {
                    const newTokenSet = await this.#client.getClientCredentialsToken()
                    this.#client.setTokenSet(newTokenSet)
                } finally {
                    this.#refreshing = false
                }
            }
        } catch (_err) {
            // If reading token failed for any reason, try to fetch a fresh one
            this.#refreshing = true
            try {
                const newTokenSet = await this.#client.getClientCredentialsToken()
                this.#client.setTokenSet(newTokenSet)
            } finally {
                this.#refreshing = false
            }
        }
    }
}
