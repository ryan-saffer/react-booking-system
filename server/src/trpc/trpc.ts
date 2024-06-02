import type { IncomingMessage, ServerResponse } from 'http'

import { getAuth } from 'firebase-admin/auth'
import { logger } from 'firebase-functions/v2'
import { HttpsError } from 'firebase-functions/v2/https'

import { initTRPC } from '@trpc/server'
import type { NodeHTTPCreateContextFnOptions } from '@trpc/server/dist/adapters/node-http'

import { AcuityClient } from '../acuity/core/acuity-client'

// INITIALISATION
const t = initTRPC.context<typeof createContext>().create()
export const router = t.router
export const middleware = t.middleware

// CONTEXT
export function createContext({
    req,
}: NodeHTTPCreateContextFnOptions<IncomingMessage, ServerResponse<IncomingMessage>>) {
    return { authToken: req.headers.authorization }
}

// MIDDLEWARE
const isAuthenticated = middleware(async ({ ctx, next }) => {
    try {
        const user = await getAuth().verifyIdToken(ctx.authToken || '')
        return next({ ctx: { ...ctx, uid: user.uid } })
    } catch {
        throw new HttpsError('unauthenticated', 'procedure requires authentication')
    }
})

const logging = middleware(({ next, path, rawInput }) => {
    if (process.env.FUNCTIONS_EMULATOR) {
        console.log(`- - - - ${path} - - - -`)
        console.log(rawInput)
        console.log('- - - - - - - - - - - - - - - - - - - -')
    } else {
        logger.debug({
            endpoint: path,
            input: rawInput,
        })
    }
    return next()
})

// PROCEDURES
export const publicProcedure = t.procedure.use(logging)
export const authenticatedProcedure = publicProcedure.use(isAuthenticated)

const acuityProcedure = publicProcedure.use(async ({ ctx, next }) => {
    const acuityClient = await AcuityClient.getInstance()
    return next({
        ctx: {
            ...ctx,
            acuityClient,
        },
    })
})
export const acuityPublicProcedure = acuityProcedure
export const acuityAuthenticatedProcedure = acuityProcedure.use(isAuthenticated)
