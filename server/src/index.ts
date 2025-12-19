// Load environment variables from server/.env or server/.env.prod based on project
import './load-env'
import './instrumentation'

// API (trpc & webhooks)
export * from './api'

// PubSub dispatcher
export * from './pubsub'

// Sentry's esbuild proxy module re-exports default; provide one to avoid warnings.
export default {}
