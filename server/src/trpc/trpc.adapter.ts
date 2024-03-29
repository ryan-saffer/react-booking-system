import { MemoryOption, logger } from 'firebase-functions/v2'
import { onRequest } from 'firebase-functions/v2/https'

import { AnyRouter } from '@trpc/server'
import { createHTTPHandler } from '@trpc/server/adapters/standalone'

import { createContext } from './trpc'

export function onRequestTrpc<TRouter extends AnyRouter>(router: TRouter, memory?: MemoryOption) {
    return onRequest(
        { region: 'australia-southeast1', cors: true, memory: memory || '256MiB' },
        createHTTPHandler({
            router,
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
}
