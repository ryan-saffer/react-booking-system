import { XeroClient } from 'xero-node'
import { env } from '../init'

let xero: XeroClient

export async function getXeroClient() {
    if (xero) return xero
    try {
        xero = new XeroClient({
            clientId: env === 'prod' ? process.env.XERO_CLIENT_ID : process.env.DEV_XERO_CLIENT_ID,
            clientSecret: env === 'prod' ? process.env.XERO_CLIENT_SECRET : process.env.DEV_XERO_CLIENT_SECRET,
            grantType: 'client_credentials',
        })

        const tokenSet = await xero.getClientCredentialsToken()
        xero.setTokenSet(tokenSet)
    } catch (err) {
        throw { message: 'error initialising xero api', error: err }
    }
    return xero
}
