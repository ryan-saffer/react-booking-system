// Load environment variables from server/.env or server/.env.prod based on project
import './app/init/load-env'
import './app/init/instrumentation'

// API (trpc & webhooks)
export * from './app/http/api'

// PubSub dispatcher
export * from './app/background/function'
