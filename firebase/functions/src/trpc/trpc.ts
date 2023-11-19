import { createHTTPHandler } from '@trpc/server/adapters/standalone'
import { z } from 'zod'

import { AnyRouter, initTRPC } from '@trpc/server'
import type { NodeHTTPCreateContextFnOptions } from '@trpc/server/dist/adapters/node-http'
import type { IncomingMessage, ServerResponse } from 'http'
import { getAuth } from 'firebase-admin/auth'
import { HttpsError, onRequest } from 'firebase-functions/v2/https'

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

// FIREBASE FUNCTIONS WRAPPER
export function onRequestTrpc<TRouter extends AnyRouter>(_router: TRouter) {
    return onRequest(
        createHTTPHandler({
            router: _router,
            createContext,
        })
    )
}

export const parties = router({
    getParties: publicProcedure.query(() => {
        console.log('running first router greeting!')
        console.log(`Hello!`)
        return { parties: ['Party 1', 'Party 2', 'Party 3'] }
    }),
})

function bookHolidayProgram(time: string) {
    return { bookingId: `your booking id for ${time}` }
}

export const holidayPrograms = router({
    bookHolidayProgram: authenticatedProcedure
        .input(
            z.object({
                time: z.string(),
            })
        )
        .mutation((data) => {
            console.log('running second router second greeting!')
            console.log(data.input.time)
            return bookHolidayProgram(data.input.time)
        }),
    secondFouterFunctionTwo: publicProcedure.query(() => 3),
})

// EXPORTED ROUTER
const appRouter = router({
    parties,
    holidayPrograms,
})
export type AppRouter = typeof appRouter
