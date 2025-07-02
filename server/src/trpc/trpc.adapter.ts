import type { MemoryOption } from 'firebase-functions/v2'
import { logger } from 'firebase-functions/v2'
import { onRequest } from 'firebase-functions/v2/https'

import type { AnyRouter } from '@trpc/server'
import { createHTTPHandler } from '@trpc/server/adapters/standalone'

import { createContext } from './trpc'
import { getErrorCode, type AppErrorCode } from './trpc.errors'

const ERRORS_TO_IGNORE: AppErrorCode[] = ['PRECONDITION_FAILED', 'UNAUTHORIZED', 'CLASS_FULL', 'PAYMENT_METHOD_INVALID']

export function onRequestTrpc<TRouter extends AnyRouter>(router: TRouter, memory?: MemoryOption) {
    return onRequest(
        { region: 'australia-southeast1', cors: true, memory: memory || '256MiB' },
        createHTTPHandler({
            router,
            createContext,
            onError: ({ error, input, path }) => {
                const errorCode = getErrorCode(error.cause ?? error, error.code)
                if (ERRORS_TO_IGNORE.includes(errorCode)) {
                    // not an error worth logging
                    return
                }
                logger.error(error.message, {
                    path,
                    input,
                    errorCode,
                    cause: error.cause,
                })
            },
        })
    )
}
