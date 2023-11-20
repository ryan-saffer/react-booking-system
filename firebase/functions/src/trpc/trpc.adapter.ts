import { AnyRouter } from '@trpc/server'
import { createContext } from './trpc'
import { onRequest } from 'firebase-functions/v2/https'
import { createHTTPHandler } from '@trpc/server/adapters/standalone'

export function onRequestTrpc<TRouter extends AnyRouter>(router: TRouter) {
    return onRequest(
        createHTTPHandler({
            router,
            createContext,
        })
    )
}
