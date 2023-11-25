import { acuityRouter } from '../acuity/functions/trpc/trpc.acuity'
import { eventsRouter } from '../events/functions/trpc/trpc.events'
import { holidayProgramsRouter } from '../holiday-programs/functions/trpc/trpc.holiday-programs'
import { partiesRouter } from '../party-bookings/functions/trpc/trpc.parties'
import { scienceProgramRouter } from '../science-program/functions/trpc/trpc.science-program'
import { staffRouter } from '../staff/functions/trpc/trpc.staffRouter'
import { stripeRouter } from '../stripe/functions/trpc/trpc.stripe'
import { router } from './trpc'

const appRouter = router({
    parties: partiesRouter,
    events: eventsRouter,
    acuity: acuityRouter,
    holidayPrograms: holidayProgramsRouter,
    stripe: stripeRouter,
    scienceProgram: scienceProgramRouter,
    staff: staffRouter,
})

export type AppRouter = typeof appRouter
