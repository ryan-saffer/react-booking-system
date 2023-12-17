import { logger } from 'firebase-functions/v2'
import { onRequest } from 'firebase-functions/v2/https'

import { publishToPubSub } from '../../../utilities'

export const paperformWebhook = onRequest(async (req, res) => {
    if (req.query.form === 'incursion') {
        logger.log('incursion form submission recieved with submission id:', req.body.submission_id)
        await publishToPubSub('paperformSubmission', { form: 'incursion', data: req.body.data })
    } else if (req.query.form === 'party') {
        logger.log('party form submission recieved with submission id:', req.body.submission_id)
        await publishToPubSub('paperformSubmission', { form: 'party', data: req.body.data })
    } else {
        logger.error(`unrecognised form sent to webhook: ${req.query.form}`)
        res.sendStatus(500)
        return
    }

    res.sendStatus(200)
    return
})
