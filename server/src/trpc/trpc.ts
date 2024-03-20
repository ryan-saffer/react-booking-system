import type { IncomingMessage, ServerResponse } from 'http'

import { getAuth } from 'firebase-admin/auth'
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
    return { authToken: req.headers.authorization, uid: req.headers.uid as string | undefined }
}

// MIDDLEWARE
const isAuthenticated = middleware(async ({ ctx, next }) => {
    try {
        await getAuth().verifyIdToken(ctx.authToken || '')
        return next()
    } catch {
        throw new HttpsError('unauthenticated', 'procedure requires authentication')
    }
})

// PROCEDURES
export const publicProcedure = t.procedure
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
