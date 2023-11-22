import { eventsRouter } from '../events/core/events-router'
import { partiesRouter } from '../partyBookings/core/parties-router'
import { router } from './trpc'
import { acuityRouter } from '../acuity/core/acuity-router'

const appRouter = router({
    parties: partiesRouter,
    events: eventsRouter,
    acuity: acuityRouter,
})

export type AppRouter = typeof appRouter
