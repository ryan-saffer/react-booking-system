import type { XeroClient as TXeroClient } from 'xero-node'
import { env } from '../init'

let client: TXeroClient

export async function getXeroClient() {
    if (client) return client
    try {
        const { XeroClient } = await import('xero-node')
        client = new XeroClient({
            clientId: env === 'prod' ? process.env.XERO_CLIENT_ID : process.env.DEV_XERO_CLIENT_ID,
            clientSecret: env === 'prod' ? process.env.XERO_CLIENT_SECRET : process.env.DEV_XERO_CLIENT_SECRET,
            grantType: 'client_credentials',
        })

        const tokenSet = await client.getClientCredentialsToken()
        client.setTokenSet(tokenSet)
    } catch (err) {
        throw { message: 'error initialising xero api', error: err }
    }
    return client
}
