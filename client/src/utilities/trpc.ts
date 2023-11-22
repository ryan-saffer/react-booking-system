import { createTRPCReact } from '@trpc/react-query'

import type { AppRouter } from '../../../server/src/trpc/trpc.app-router'

export const trpc = createTRPCReact<AppRouter>()
