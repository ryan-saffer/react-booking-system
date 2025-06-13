import type { MemoryOption } from 'firebase-functions/v2'
import { logger } from 'firebase-functions/v2'
import { onRequest } from 'firebase-functions/v2/https'

import type { AnyRouter } from '@trpc/server'
import { createHTTPHandler } from '@trpc/server/adapters/standalone'

import { createContext } from './trpc'
import type { AppErrorCode } from './trpc.errors'

const ERRORS_TO_IGNORE: AppErrorCode[] = ['PRECONDITION_FAILED', 'UNAUTHORIZED', 'CLASS_FULL']

export function onRequestTrpc<TRouter extends AnyRouter>(router: TRouter, memory?: MemoryOption) {
    return onRequest(
        { region: 'australia-southeast1', cors: true, memory: memory || '256MiB' },
        createHTTPHandler({
            router,
            createContext,
            onError: ({ error, input, path }) => {
                if (ERRORS_TO_IGNORE.includes(error.code)) {
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
