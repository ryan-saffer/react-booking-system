
import { initTRPC } from '@trpc/server'
import { getAuth } from 'firebase-admin/auth'
import { logger } from 'firebase-functions/v2'


import { AcuityClient } from '../acuity/core/acuity-client'
import { throwTrpcError } from '../utilities'
import { getErrorCode } from './trpc.errors'

import type * as trpcExpress from '@trpc/server/adapters/express'

// INITIALISATION
const t = initTRPC.context<typeof createContext>().create({
    errorFormatter({ shape, error }) {
        return {
            ...shape,
            data: {
                ...shape.data,
                code: getErrorCode(error.cause ?? error, error.code),
            },
        }
    },
})
export const router = t.router
export const middleware = t.middleware

// CONTEXT
export function createContext({ req }: trpcExpress.CreateExpressContextOptions) {
    return { authToken: req.headers.authorization }
}

// MIDDLEWARE
const isAuthenticated = middleware(async ({ ctx, next }) => {
    try {
        const user = await getAuth().verifyIdToken(ctx.authToken || '')
        return next({ ctx: { ...ctx, uid: user.uid } })
    } catch {
        throwTrpcError('UNAUTHORIZED', 'procedure requires authentication')
    }
})

const logging = middleware(async ({ next, path, getRawInput }) => {
    const input = await getRawInput()
    if (process.env.FUNCTIONS_EMULATOR) {
        console.log(`- - - - ${path} - - - -`)
        console.log(input)
        console.log('- - - - - - - - - - - - - - - - - - - -')
    } else {
        logger.debug({
            endpoint: path,
            input,
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
