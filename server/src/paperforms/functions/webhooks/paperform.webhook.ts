import { logger } from 'firebase-functions/v2'
import { onRequest } from 'firebase-functions/v2/https'

import { publishToPubSub } from '../../../utilities'

export const paperformWebhook = onRequest(async (req, res) => {
    logger.log(`${req.query.form} form submission received with submission id:`, req.body.submission_id)
    console.log(req.body)
    if (req.query.form === 'incursion') {
        await publishToPubSub('paperformSubmission', { form: 'incursion', data: req.body.data })
    } else if (req.query.form === 'party') {
        await publishToPubSub('paperformSubmission', { form: 'party', data: req.body.data })
    } else if (req.query.form === 'party-v2') {
        await publishToPubSub('paperformSubmission', {
            form: 'party-v2',
            data: req.body.data,
            charge: req.body.charge?.charge,
        })
    } else {
        logger.error(`unrecognised form sent to webhook: ${req.query.form}`)
        res.sendStatus(500)
        return
    }

    res.sendStatus(200)
    return
})
