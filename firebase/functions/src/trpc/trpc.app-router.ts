import { partiesRouter } from '../partyBookings/core/parties-router'
import { router } from './trpc'

const appRouter = router({
    parties: partiesRouter,
})

export type AppRouter = typeof appRouter
