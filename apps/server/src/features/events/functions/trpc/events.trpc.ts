import type { Event } from '@fizz-kidz/core'

import { authenticatedProcedure, router } from '@/app/trpc/trpc'
import { createEvent, type CreateEvent } from '@/features/events/core/create-event'
import { deleteEvent } from '@/features/events/core/delete-event'
import { updateEvent } from '@/features/events/core/update-event'

export const eventsRouter = router({
    createEvent: authenticatedProcedure
        .input((input: unknown) => input as CreateEvent)
        .mutation(async ({ input }) => {
            await createEvent(input)
        }),
    updateEvent: authenticatedProcedure
        .input((input: unknown) => input as Event)
        .mutation(async ({ input }) => {
            await updateEvent(input)
        }),
    deleteEvent: authenticatedProcedure
        .input((input: unknown) => input as Event)
        .mutation(async ({ input }) => {
            await deleteEvent(input)
        }),
})
