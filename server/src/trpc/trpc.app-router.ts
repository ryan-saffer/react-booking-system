import { acuityRouter } from '../acuity/functions/trpc/trpc.acuity'
import { afterSchoolProgramRouter } from '../after-school-program/functions/trpc/trpc.after-school-program'
import { authRouter } from '../auth/functions/trpc/trpc.auth'
import { eventsRouter } from '../events/functions/trpc/trpc.events'
import { holidayProgramsRouter } from '../holiday-programs/functions/trpc/trpc.holiday-programs'
import { partiesRouter } from '../party-bookings/functions/trpc/trpc.parties'
import { playLabRouter } from '../play-lab/functions/trpc/trpc.play-lab'
import { staffRouter } from '../staff/functions/trpc/trpc.staffRouter'
import { router } from './trpc'

export const appRouter = router({
    parties: partiesRouter,
    events: eventsRouter,
    acuity: acuityRouter,
    holidayPrograms: holidayProgramsRouter,
    afterSchoolProgram: afterSchoolProgramRouter,
    staff: staffRouter,
    auth: authRouter,
    playLab: playLabRouter,
})

export type AppRouter = typeof appRouter
