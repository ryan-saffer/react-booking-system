import { createTRPCContext } from '@trpc/tanstack-react-query'

import type { AppRouter } from '../../../server/src/trpc/trpc.app-router'

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>()
