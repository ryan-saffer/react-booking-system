import express from 'express'
import { logger } from 'firebase-functions/v2'

import { publishToPubSub } from '../../../utilities'

const PDF_KEY = '7843d2a'

export const paperformWebhook = express.Router()

paperformWebhook.post('/paperformWebhook', async (req, res) => {
    logger.log(`${req.query.form} form submission received with submission id:`, req.body.submission_id)
    if (req.query.form === 'incursion') {
        await publishToPubSub('paperformSubmission', { form: 'incursion', data: req.body.data })
    } else if (req.query.form === 'party') {
        await publishToPubSub('paperformSubmission', { form: 'party', data: req.body.data })
    } else if (req.query.form === 'party-v2') {
        await publishToPubSub('paperformSubmission', { form: 'party-v2', data: req.body.data })
    } else if (req.query.form === 'party-v3') {
        await publishToPubSub('paperformSubmission', { form: 'party-v3', data: req.body.data })
    } else if (req.query.form === 'onboarding') {
        await publishToPubSub('paperformSubmission', {
            form: 'onboarding',
            data: {
                formData: req.body.data,
                pdfUrl: req.body.pdfs[PDF_KEY].url,
            },
        })
    } else {
        logger.error(`unrecognised form sent to webhook: ${req.query.form}`)
        res.sendStatus(500)
        return
    }

    res.sendStatus(200)
    return
})
