import type { PubSubFunctions } from '@fizz-kidz/core'

import { PubSubClient } from './pubsub.client'

export async function publishToPubSub<T extends keyof PubSubFunctions>(topic: T, data: PubSubFunctions[T]) {
    const pubsub = await PubSubClient.getInstance()
    return pubsub.topic(topic).publishMessage({ data: Buffer.from(JSON.stringify(data)) })
}
