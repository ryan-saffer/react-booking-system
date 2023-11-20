import { initTRPC } from '@trpc/server'
import type { NodeHTTPCreateContextFnOptions } from '@trpc/server/dist/adapters/node-http'
import type { IncomingMessage, ServerResponse } from 'http'
import { getAuth } from 'firebase-admin/auth'
import { HttpsError } from 'firebase-functions/v2/https'

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
        await getAuth().verifyIdToken(ctx.authToken || '')
        return next()
    } catch {
        throw new HttpsError('unauthenticated', 'procedure requires authentication')
    }
})

// PROCEDURES
export const publicProcedure = t.procedure
export const authenticatedProcedure = publicProcedure.use(isAuthenticated)
