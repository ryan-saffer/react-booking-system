import { onMessagePublished as fireOnMessagePublished } from 'firebase-functions/v2/pubsub'

import type { PubSubFunctions } from '@fizz-kidz/core'

export function onMessagePublished<T extends keyof PubSubFunctions>(topic: T, fn: (data: PubSubFunctions[T]) => void) {
    return fireOnMessagePublished({ topic, region: 'australia-southeast1', concurrency: 1, maxInstances: 1 }, (event) =>
        fn(event.data.message.json)
    )
}
