import { onRequest } from 'firebase-functions/v2/https'

import { API_CORS_ORIGINS } from './cors-origins'

import type { App } from './app'

import { env } from '@/app/init/firebase'

let appPromise: Promise<App> | undefined

export const api = onRequest(
    {
        region: 'australia-southeast1',
        cors: API_CORS_ORIGINS,
        memory: '1GiB',
        minInstances: env === 'prod' ? 1 : 0,
    },
    async (req, res) => {
        // lazy init the api. this keeps cold starts snappy, particularly for pubsub.
        appPromise ??= import('./app').then(({ app }) => app)
        const app = await appPromise
        app(req, res)
    }
)
