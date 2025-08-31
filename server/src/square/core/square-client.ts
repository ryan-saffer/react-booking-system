import { SquareEnvironment, type SquareClient as TSquare } from 'square'

import { env } from '../../init'
import type { ClientStatus } from '../../utilities/types'

export class SquareClient {
    private static instance: SquareClient
    #status: ClientStatus = 'not-initialised'

    #client: TSquare | null = null

    private constructor() {}

    static async getInstance() {
        if (!SquareClient.instance) {
            SquareClient.instance = new SquareClient()
            await SquareClient.instance.#initialise()
        }
        while (SquareClient.instance.#status === 'initialising') {
            await new Promise((resolve) => setTimeout(resolve, 20))
        }
        if (!SquareClient.instance.#client) {
            throw new Error('Square client not initialised')
        }
        return SquareClient.instance.#client
    }

    async #initialise() {
        this.#status = 'initialising'
        const { SquareClient: Square } = await import('square')
        const token = env === 'dev' ? process.env.SQUARE_DEV_TOKEN : process.env.SQUARE_PROD_TOKEN
        const environment = env === 'dev' ? SquareEnvironment.Sandbox : SquareEnvironment.Production
        this.#client = new Square({ token, version: '2025-04-16', environment })
        this.#status = 'initialised'
    }
}
