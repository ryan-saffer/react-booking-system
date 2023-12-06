import { logger } from 'firebase-functions/v2'
import { onRequest } from 'firebase-functions/v2/https'

import { publishToPubSub } from '../../../utilities'

export const onPartyFormSubmit = onRequest(async (req, res) => {
    logger.log(req.body.data)

    await publishToPubSub('handlePartyFormSubmission', req.body.data)

    res.status(200).send()

    return
})
