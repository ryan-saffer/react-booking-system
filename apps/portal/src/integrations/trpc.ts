import { createTRPCContext } from '@trpc/tanstack-react-query'

import type { AppRouter } from '@server/app/trpc/app.trpc'

export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>()
