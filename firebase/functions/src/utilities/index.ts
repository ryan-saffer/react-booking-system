import { PubSub } from '@google-cloud/pubsub'
import * as functions from 'firebase-functions'
import { FirebaseFunctions, PubSubFunctions } from 'fizz-kidz'
import { projectId } from '../init'

export function onCall<T extends keyof FirebaseFunctions>(
    fn: (
        input: FirebaseFunctions[T]['input'],
        _context: functions.https.CallableContext
    ) => FirebaseFunctions[T]['result']['data'] | Promise<FirebaseFunctions[T]['result']['data']>
) {
    return functions.region('australia-southeast1').https.onCall(fn)
}

export function onRequest<T extends keyof FirebaseFunctions>(
    fn: (
        req: functions.https.Request,
        resp: functions.Response<FirebaseFunctions[T]['result']['data']>
    ) => void | Promise<void>
) {
    return functions.region('australia-southeast1').https.onRequest(fn)
}

export function onPubSub<T extends keyof PubSubFunctions>(
    topic: T,
    fn: (data: PubSubFunctions[T], context: functions.EventContext) => void
) {
    return functions
        .region('australia-southeast1')
        .pubsub.topic(topic)
        .onPublish((message, context) => fn(message.json, context))
}

export function publishToPubSub<T extends keyof PubSubFunctions>(topic: T, data: PubSubFunctions[T]) {
    const pubsub = new PubSub({ projectId })
    return pubsub.topic(topic).publishMessage({ data: Buffer.from(JSON.stringify(data)) })
}

/**
 * Retry a function with exponential backoff if it fails with expected error codes. Will retry 3 times before failing for good.
 *
 * @param fn the function you want to run
 * @param backoffCodes the error codes you want to retry for. Any error codes faced that are not included here will not be retried.
 * @param retryCount keeps track of the number of times the function has been attempted.
 */
export function withExponentialBackoff<T extends () => any>(
    fn: T,
    backoffCodes: number[],
    retryCount = 0
): Promise<ReturnType<T>> {
    return new Promise((resolve, reject) => {
        const runFunction = async () => {
            try {
                const result = await fn()
                resolve(result)
            } catch (err: any) {
                if (backoffCodes.includes(err.code)) {
                    if (retryCount <= 2) {
                        console.log(`Error code ${err.code} found. Running again, with retryCount of ${retryCount + 1}`)
                        setTimeout(runFunction, Math.pow(2, retryCount + 1))
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
