import { onRequest } from 'firebase-functions/v2/https'

import { DatabaseClient } from '../../firebase/DatabaseClient'

export const esignaturesWebhook = onRequest(async (req, res) => {
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
        await DatabaseClient.updateEmployeeContract(
            req.body.data.contract.metadata,
            req.body.data.contract.contract_pdf_url
        )
    }
    res.sendStatus(200)
    return
})
