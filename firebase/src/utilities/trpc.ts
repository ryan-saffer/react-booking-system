import { createTRPCReact } from '@trpc/react-query'

import type { AppRouter } from '../../functions/src/trpc/trpc'

export const trpc = createTRPCReact<AppRouter>()
