import type { ClientStatus } from '../utilities/types'
import type { Firestore } from 'firebase-admin/firestore'


export class FirestoreClient {
    private static instance: FirestoreClient
    #status: ClientStatus = 'not-initialised'

    #client: Firestore | null = null

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
        const { getFirestore } = await import('firebase-admin/firestore')
        this.#client = getFirestore()
        this.#client.settings({ ignoreUndefinedProperties: true })
        this.#status = 'initialised'
    }
}
