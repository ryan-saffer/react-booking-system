import { onRequestTrpc } from '../../../trpc/trpc.adapter'
import { partiesRouter } from '../../core/parties-router'

export const parties = onRequestTrpc(partiesRouter)
