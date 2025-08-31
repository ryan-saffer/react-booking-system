import type { Event } from 'fizz-kidz'
import { authenticatedProcedure, router } from '@/trpc/trpc'
import { createEvent, type CreateEvent } from '@/events/core/create-event'
import { updateEvent } from '@/events/core/update-event'
import { deleteEvent } from '@/events/core/delete-event'

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
