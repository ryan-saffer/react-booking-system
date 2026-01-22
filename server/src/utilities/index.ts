import * as Sentry from '@sentry/node'
import { TRPCError } from '@trpc/server'
import { logger } from 'firebase-functions/v2'
import { HttpsError, type FunctionsErrorCode } from 'firebase-functions/v2/https'
import { onMessagePublished as fireOnMessagePublished } from 'firebase-functions/v2/pubsub'

import type { PubSubFunctions } from 'fizz-kidz'

import { PubSubClient } from '@/firebase/PubSubClient'
import type { CustomTrpcError } from '@/trpc/trpc.errors'

import type { TRPC_ERROR_CODE_KEY } from '@trpc/server'
import type { DateTime } from 'luxon'

export function onMessagePublished<T extends keyof PubSubFunctions>(topic: T, fn: (data: PubSubFunctions[T]) => void) {
    return fireOnMessagePublished({ topic, region: 'australia-southeast1', concurrency: 1, maxInstances: 1 }, (event) =>
        fn(event.data.message.json)
    )
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
    Sentry.captureException(error)
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
        throw new HttpsError(code, message, { ...(hasAdditionalInfo && additionalInfo) })
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
    Sentry.captureException(error)
    throw new TRPCError({
        code,
        message,
        cause: {
            error: error instanceof Error ? { message: error.message, stack: error.stack, name: error.name } : error,
            additionalInfo,
        },
    })
}

/**
 * For when you want to throw an error with a custom error code, so that client can handle that particular scenario.
 */
export function throwCustomTrpcError(error: CustomTrpcError): never {
    throw new TRPCError({
        code: 'BAD_REQUEST',
        cause: error,
    })
}

export function midnight(date: DateTime) {
    return date.set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
}
