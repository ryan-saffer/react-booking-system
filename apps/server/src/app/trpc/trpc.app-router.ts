import { afterSchoolProgramRouter } from '@/features/after-school-program/functions/trpc/trpc.after-school-program'
import { authRouter } from '@/features/auth/functions/trpc/trpc.auth'
import { creationsRouter } from '@/features/creations/functions/trpc/trpc.creations'
import { eventsRouter } from '@/features/events/functions/trpc/trpc.events'
import { holidayProgramsRouter } from '@/features/holiday-programs/functions/trpc/trpc.holiday-programs'
import { inventoryRouter } from '@/features/inventory/functions/trpc/trpc.inventory'
import { partiesRouter } from '@/features/party-bookings/functions/trpc/trpc.parties'
import { playLabRouter } from '@/features/play-lab/functions/trpc/trpc.play-lab'
import { preschoolProgramV2Router } from '@/features/preschool-program-v2/functions/trpc/trpc.preschool-program-v2'
import { preschoolProgramRouter } from '@/features/preschool-program/functions/trpc/trpc.preschool-program'
import { reportsRouter } from '@/features/reports/functions/trpc/trpc.reports'
import { staffRouter } from '@/features/staff/functions/trpc/trpc.staffRouter'
import { acuityRouter } from '@/integrations/acuity/functions/trpc/trpc.acuity'

import { router } from './trpc'

export const appRouter = router({
    parties: partiesRouter,
    events: eventsRouter,
    acuity: acuityRouter,
    holidayPrograms: holidayProgramsRouter,
    afterSchoolProgram: afterSchoolProgramRouter,
    preschoolProgram: preschoolProgramRouter,
    preschoolProgramV2: preschoolProgramV2Router,
    staff: staffRouter,
    auth: authRouter,
    playLab: playLabRouter,
    creations: creationsRouter,
    reports: reportsRouter,
    inventory: inventoryRouter,
})

export type AppRouter = typeof appRouter
