import { acuityRouter } from '../acuity/functions/trpc/trpc.acuity'
import { adminRouter } from '../admin/functions/trpc/trpc.admin'
import { afterSchoolProgramRouter } from '../after-school-program/functions/trpc/trpc.after-school-program'
import { eventsRouter } from '../events/functions/trpc/trpc.events'
import { holidayProgramsRouter } from '../holiday-programs/functions/trpc/trpc.holiday-programs'
import { partiesRouter } from '../party-bookings/functions/trpc/trpc.parties'
import { staffRouter } from '../staff/functions/trpc/trpc.staffRouter'
import { stripeRouter } from '../stripe/functions/trpc/trpc.stripe'
import { router } from './trpc'

const appRouter = router({
    parties: partiesRouter,
    events: eventsRouter,
    acuity: acuityRouter,
    holidayPrograms: holidayProgramsRouter,
    stripe: stripeRouter,
    afterSchoolProgram: afterSchoolProgramRouter,
    staff: staffRouter,
    admin: adminRouter,
})

export type AppRouter = typeof appRouter
