import * as Sentry from '@sentry/node'

import { env } from './init'

// Ensure to call this before requiring any other modules!
Sentry.init({
    dsn: 'https://5ac100bcc9a87424190a0876610c9b89@o4510520644927488.ingest.us.sentry.io/4510520645910528',
    // Adds request headers and IP for users, for more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/node/configuration/options/#sendDefaultPii
    environment: env,
    sendDefaultPii: true,
})
