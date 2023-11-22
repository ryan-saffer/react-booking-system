import { acuityRouter } from '../../core/acuity-router'
import { onRequestTrpc } from '../../../trpc/trpc.adapter'

export const acuity = onRequestTrpc(acuityRouter)
