import type { AppRouter } from '../../functions/src/trpc/trpc.app-router'
import { createTRPCReact } from '@trpc/react-query'

export const trpc = createTRPCReact<AppRouter>()
