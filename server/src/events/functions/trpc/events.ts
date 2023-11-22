import { onRequestTrpc } from '../../../trpc/trpc.adapter'
import { eventsRouter } from '../../core/events-router'

export const events = onRequestTrpc(eventsRouter)
