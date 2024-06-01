import { Event } from 'fizz-kidz'

import { authenticatedProcedure, router } from '../../../trpc/trpc'
import { CreateEvent, createEvent } from '../../core/create-event'
import { deleteEvent } from '../../core/delete-event'
import { updateEvent } from '../../core/update-event'

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
