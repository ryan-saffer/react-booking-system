import type { ClientStatus } from '../utilities/types'
import type { Storage } from 'firebase-admin/storage'


export class StorageClient {
    private static instance: StorageClient
    #status: ClientStatus = 'not-initialised'

    #client: Storage | null = null

    private constructor() {}

    static async getInstance() {
        if (!StorageClient.instance) {
            StorageClient.instance = new StorageClient()
            await StorageClient.instance.#initialise()
        }
        while (StorageClient.instance.#status === 'initialising') {
            await new Promise((resolve) => setTimeout(resolve, 20))
        }
        if (!StorageClient.instance.#client) {
            throw new Error('Storage client not initialised')
        }
        return StorageClient.instance.#client
    }

    async #initialise() {
        this.#status = 'initialising'
        const { getStorage } = await import('firebase-admin/storage')
        this.#client = getStorage()
        this.#status = 'initialised'
    }
}
