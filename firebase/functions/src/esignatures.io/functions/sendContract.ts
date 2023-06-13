import * as functions from 'firebase-functions'
import { ESignatureClient } from '../core/ESignaturesClient'

export const sendContract = functions.region('australia-southeast1').https.onRequest(async (req, resp) => {
    const client = new ESignatureClient()

    try {
        const result = await client.sendContract({
            email: 'ryansaffer@gmail.com',
            mobile: '+61413892120',
            templateVariables: {
                name: 'Ryan Saffer',
                address: '20 Glenferrie Rd, Malvern VIC 3144',
                position: 'Party Facilitator',
                wage: '24.78',
                commencementDate: '21/05/23',
                managerName: 'Bonnie Rowe',
                managerPosition: 'Malvern Studio Manager',
                sendersName: 'Talia Meltzer',
                sendersPosition: 'Managing Director',
            },
        })
        console.log(result)
    } catch (err) {
        functions.logger.error('error creating contract', err)
        resp.status(500).send()
        return
    }

    resp.status(200).send()
    return
})
