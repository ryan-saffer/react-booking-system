import { acuityRouter } from '../acuity/functions/trpc/trpc.acuity'
import { eventsRouter } from '../events/functions/trpc/trpc.events'
import { holidayProgramsRouter } from '../holidayPrograms/functions/trpc/trpc.holiday-programs'
import { partiesRouter } from '../partyBookings/functions/trpc/trpc.parties'
import { router } from './trpc'
import { stripeRouter } from '../stripe/functions/trpc/trpc.stripe'

const appRouter = router({
    parties: partiesRouter,
    events: eventsRouter,
    acuity: acuityRouter,
    holidayPrograms: holidayProgramsRouter,
    stripe: stripeRouter,
})

export type AppRouter = typeof appRouter
