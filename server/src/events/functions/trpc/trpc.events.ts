import type { Event } from 'fizz-kidz'

import { createEvent, type CreateEvent } from '@/events/core/create-event'
import { deleteEvent } from '@/events/core/delete-event'
import { updateEvent } from '@/events/core/update-event'
import { authenticatedProcedure, router } from '@/trpc/trpc'

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
