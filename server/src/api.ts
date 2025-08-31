import express from 'express'
import { logger } from 'firebase-functions/v2'
import { onRequest } from 'firebase-functions/v2/https'

import * as trpcExpress from '@trpc/server/adapters/express'

import { acuityWebhook } from './acuity/functions/acuity.webhook'
import { esignaturesWebhook } from './esignatures.io/functions/esignatures.webhook'
import { partyFormRedirect } from './paperforms/functions/webhooks/paperform-redirect'
import { paperformWebhook } from './paperforms/functions/webhooks/paperform.webhook'
import { createContext } from './trpc/trpc'
import { appRouter } from './trpc/trpc.app-router'
import { websiteFormsWebhook } from './website/functions/webhooks/website-forms-webhook'

const app = express()

// TRPC
app.use(
    '/trpc',
    trpcExpress.createExpressMiddleware({
        router: appRouter,
        createContext,
        onError: ({ error, input, path }) => {
            if (error.code === 'PRECONDITION_FAILED') {
                // not an error worth logging
                return
            }
            logger.error(error.message, {
                path,
                input,
                errorCode: error.code,
                cause: error.cause,
            })
        },
    })
)

// WEBHOOKS
const webhooks = express.Router()
webhooks.use((req, _, next) => {
    if (process.env.FUNCTIONS_EMULATOR) {
        console.log(`- - - - ${req.path} - - - -`)
        console.log(req.body)
        console.log('- - - - - - - - - - - - - - - - - - - -')
    } else {
        logger.debug(req.path, {
            endpoint: req.path,
            method: req.method,
            input: req.body,
        })
    }
    next()
})

webhooks.use('/webhooks', [acuityWebhook, esignaturesWebhook, paperformWebhook, partyFormRedirect, websiteFormsWebhook])

app.use(webhooks)

export const api = onRequest({ region: 'australia-southeast1', cors: true, memory: '2GiB' }, app)
