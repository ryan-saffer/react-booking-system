import type { Firestore } from 'firebase-admin/firestore'
import { ClientStatus } from '../utilities/types'

export class FirestoreClient {
    private static instance: FirestoreClient
    #status: ClientStatus = 'not-initialised'

    #client: Firestore | null = null

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private constructor() {}

    static async getInstance() {
        if (!FirestoreClient.instance) {
            FirestoreClient.instance = new FirestoreClient()
            await FirestoreClient.instance.#initialise()
        }
        while (FirestoreClient.instance.#status === 'initialising') {
            await new Promise((resolve) => setTimeout(resolve, 20))
        }
        if (!FirestoreClient.instance.#client) {
            throw new Error('Firestore client not initialised')
        }
        return FirestoreClient.instance.#client
    }

    async #initialise() {
        this.#status = 'initialising'
        const firestore = await import('firebase-admin/firestore')
        this.#client = firestore.getFirestore()
        this.#client.settings({ ignoreUndefinedProperties: true })
        this.#status = 'initialised'
    }
}
