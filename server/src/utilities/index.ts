import {
    HttpsError,
    onCall as fireOnCall,
    onRequest as fireOnRequest,
    type FunctionsErrorCode,
    type Request,
} from 'firebase-functions/v2/https'
import { onMessagePublished as fireOnMessagePublished } from 'firebase-functions/v2/pubsub'
import { logger } from 'firebase-functions/v2'
import type { Response } from 'express'
import type { FirebaseFunctions, PubSubFunctions } from 'fizz-kidz'
import { PubSubClient } from '../firebase/PubSubClient'
import { TRPCError } from '@trpc/server'
import { TRPC_ERROR_CODE_KEY } from '@trpc/server/dist/rpc'

export function onCall<T extends keyof FirebaseFunctions>(
    fn: (
        input: FirebaseFunctions[T]['input']
    ) => FirebaseFunctions[T]['result']['data'] | Promise<FirebaseFunctions[T]['result']['data']>
) {
    return fireOnCall((request) => fn(request.data))
}

export function onRequest<T extends keyof FirebaseFunctions>(
    fn: (req: Request, resp: Response<FirebaseFunctions[T]['result']['data']>) => void | Promise<void>
) {
    return fireOnRequest(fn)
}

export function onMessagePublished<T extends keyof PubSubFunctions>(topic: T, fn: (data: PubSubFunctions[T]) => void) {
    return fireOnMessagePublished(topic, (event) => fn(event.data.message.json))
}

export async function publishToPubSub<T extends keyof PubSubFunctions>(topic: T, data: PubSubFunctions[T]) {
    const pubsub = await PubSubClient.getInstance()
    return pubsub.topic(topic).publishMessage({ data: Buffer.from(JSON.stringify(data)) })
}

/**
 * Retry a function with exponential backoff if it fails with expected error codes. Will retry 3 times before failing for good.
 *
 * @param fn the function you want to run
 * @param backoffCodes the error codes you want to retry for. Any error codes faced that are not included here will not be retried.
 * @param retryCount keeps track of the number of times the function has been attempted.
 */
export function withExponentialBackoff<T extends () => any>(fn: T, backoffCodes: number[]): Promise<ReturnType<T>> {
    let retryCount = 0
    return new Promise((resolve, reject) => {
        const runFunction = async () => {
            try {
                const result = await fn()
                resolve(result)
            } catch (err: any) {
                if (backoffCodes.includes(err.code)) {
                    if (retryCount <= 2) {
                        logger.log(`Error code ${err.code} found. Running again, with retryCount of ${retryCount + 1}`)
                        setTimeout(runFunction, Math.pow(2, retryCount + 1))
                        retryCount++
                    } else {
                        reject(err)
                    }
                } else {
                    reject(err)
                }
            }
        }

        runFunction().catch(reject)
    })
}

export function logError(message: string, error?: unknown, additionalInfo: object = {}) {
    const hasAdditionalInfo = Object.keys(additionalInfo).length !== 0
    if (error) {
        if (error instanceof Error) {
            logger.error(
                message,
                {
                    errorDetails: { name: error.name, message: error.message },
                },
                { ...(hasAdditionalInfo && { additionalInfo }) }
            )
        } else if (typeof error === 'string') {
            logger.error(
                message,
                {
                    errorDetails: error,
                },
                { ...(hasAdditionalInfo && { additionalInfo }) }
            )
        } else if (typeof error === 'object') {
            logger.error(message, { errorDetails: { ...error } }, { ...(hasAdditionalInfo && additionalInfo) })
        } else {
            logger.error(message, { errorDetails: error }, { ...(hasAdditionalInfo && additionalInfo) })
        }
    } else {
        logger.error(message, { ...(hasAdditionalInfo && additionalInfo) })
    }
}
export function throwFunctionsError(
    code: FunctionsErrorCode,
    message: string,
    error?: unknown,
    additionalInfo: object = {}
): never {
    const hasAdditionalInfo = Object.keys(additionalInfo).length !== 0
    if (error) {
        if (error instanceof Error) {
            throw new HttpsError(code, message, {
                errorDetails: { name: error.name, message: error.message },
                ...(hasAdditionalInfo && additionalInfo),
            })
        } else if (typeof error === 'string') {
            throw new HttpsError(code, message, {
                errorDetails: error,
                ...(hasAdditionalInfo && additionalInfo),
            })
        } else if (typeof error === 'object') {
            throw new HttpsError(code, message, {
                errorDetails: { ...error },
                ...(hasAdditionalInfo && additionalInfo),
            })
        } else {
            throw new HttpsError(code, message, {
                errorDetails: error,
                ...(hasAdditionalInfo && additionalInfo),
            })
        }
    } else {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message, cause: { error, additionalInfo } })
        // throw new HttpsError(code, message, { ...(hasAdditionalInfo && additionalInfo) })
    }
}

/**
 *
 * @param code Error code
 * @param message Error message
 * @param error Error object
 * @param additionalInfo Additional information other than the input, as this is already logged in the adapter.
 */
export function throwTrpcError(
    code: TRPC_ERROR_CODE_KEY,
    message: string,
    error?: unknown,
    additionalInfo: object = {}
): never {
    throw new TRPCError({
        code,
        message,
        cause: { error, additionalInfo },
    })
}
