import { eventsRouter } from './../events/core/events-router'
import { partiesRouter } from '../partyBookings/core/parties-router'
import { router } from './trpc'

const appRouter = router({
    parties: partiesRouter,
    events: eventsRouter,
})

export type AppRouter = typeof appRouter
