import type { PubSub as TPubSub } from '@google-cloud/pubsub'
import { ClientStatus } from '../utilities/types'
import { projectId } from '../init'

export class PubSubClient {
    private static instance: PubSubClient
    #status: ClientStatus = 'not-initialised'

    #client: TPubSub | null = null

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private constructor() {}

    static async getInstance() {
        if (!PubSubClient.instance) {
            PubSubClient.instance = new PubSubClient()
            await PubSubClient.instance.#initialise()
        }
        while (PubSubClient.instance.#status === 'initialising') {
            await new Promise((resolve) => setTimeout(resolve, 20))
        }
        if (!PubSubClient.instance.#client) {
            throw new Error('PubSub client not initialised')
        }
        return PubSubClient.instance.#client
    }

    async #initialise() {
        this.#status = 'initialising'
        const { PubSub } = await import('@google-cloud/pubsub')
        this.#client = new PubSub({ projectId })
        this.#status = 'initialised'
    }
}
