import express from 'express'
import { logger } from 'firebase-functions/v2'
import { assertNever, type PubSubFunctions } from 'fizz-kidz'

import { logError, publishToPubSub } from '@/utilities'

const PDF_KEY = '7843d2a'

export const paperformWebhook = express.Router()

paperformWebhook.post('/paperform', async (req, res) => {
    logger.log(`${req.query.form} form submission received with submission id:`, req.body.submission_id)
    const form = req.query.form as PubSubFunctions['paperformSubmission']['form']
    switch (form) {
        case 'incursion': {
            await publishToPubSub('paperformSubmission', { form: 'incursion', data: req.body.data })
            break
        }

        case 'onboarding': {
            await publishToPubSub('paperformSubmission', {
                form: 'onboarding',
                data: {
                    formData: req.body.data,
                    pdfUrl: req.body.pdfs[PDF_KEY].url,
                },
            })
            break
        }
        default: {
            assertNever(form)
            logError(`unrecognised form sent to webhook: ${req.query.form}`)
            res.sendStatus(500)
            return
        }
    }

    res.sendStatus(200)
    return
})
