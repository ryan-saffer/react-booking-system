import { createTRPCContext } from '@trpc/tanstack-react-query'

import type { AppRouter } from '../../../server/src/app/trpc/trpc.app-router'

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>()
