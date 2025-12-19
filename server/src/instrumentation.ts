import * as Sentry from '@sentry/node'

import { env } from './init'

// Ensure to call this before requiring any other modules!
Sentry.init({
    dsn: 'https://13310be65422c17626ed44ab5d5688f9@o4510520644927488.ingest.us.sentry.io/4510525352771584',
    // Adds request headers and IP for users, for more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/node/configuration/options/#sendDefaultPii
    environment: env,
    sendDefaultPii: true,
})
