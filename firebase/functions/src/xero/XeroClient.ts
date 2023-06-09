import { XeroClient } from 'xero-node'

let xero: XeroClient

export async function getXeroClient() {
    if (xero) return xero
    try {
        xero = new XeroClient({
            clientId: process.env.XERO_CLIENT_ID ?? '',
            clientSecret: process.env.XERO_CLIENT_SECRET ?? '',
            grantType: 'client_credentials',
        })

        const tokenSet = await xero.getClientCredentialsToken()
        xero.setTokenSet(tokenSet)
    } catch (err) {
        throw { message: 'error initialising xero api', error: err }
    }
    return xero
}
