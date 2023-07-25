import * as functions from 'firebase-functions'
import { FirestoreClient } from '../../firebase/FirestoreClient'

export const esignaturesWebhook = functions.region('australia-southeast1').https.onRequest(async (req, res) => {
    // verify webhook is from esignatures
    const authToken = req.headers.authorization
    if (!authToken) {
        res.sendStatus(401)
        return
    }
    if (authToken.startsWith('Basic')) {
        const data = authToken.split(' ')[1]
        const token = Buffer.from(data, 'base64').toString('utf-8').replace(':', '')
        if (token !== process.env.ESIGNATURES_SECRET) {
            res.sendStatus(401)
            return
        }
    } else {
        res.sendStatus(401)
        return
    }

    if (req.body.status === 'contract-signed') {
        await FirestoreClient.updateEmployeeContract(
            req.body.data.contract.metadata,
            req.body.data.contract.contract_pdf_url
        )
    }
    res.sendStatus(200)
    return
})
