import './index.css'

import React from 'react'
import { createRoot } from 'react-dom/client'

import * as Sentry from '@sentry/react'

import { App } from './app'

Sentry.init({
    dsn: 'https://5ac100bcc9a87424190a0876610c9b89@o4510520644927488.ingest.us.sentry.io/4510520645910528',
    environment: import.meta.env.VITE_ENV,
    // Setting this option to true will send default PII data to Sentry.
    // For example, automatic IP address collection on events
    sendDefaultPii: true,
})

const root = createRoot(document.getElementById('root')!)
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)
