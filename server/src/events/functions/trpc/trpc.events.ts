import { EventBooking, WithoutId } from 'fizz-kidz'
import { authenticatedProcedure, router } from '../../../trpc/trpc'

import { createEvent } from '../../core/create-event'
import { deleteEvent } from '../../core/delete-event'
import { onRequestTrpc } from '../../../trpc/trpc.adapter'
import { updateEvent } from '../../core/update-event'

export type CreateEvent = {
    event: WithoutId<Omit<EventBooking, 'startTime' | 'endTime' | 'calendarEventId'>> & {
        slots: {
            startTime: Date
            endTime: Date
        }[]
    }
    sendConfirmationEmail: boolean
    emailMessage: string
}
export type UpdateEvent = EventBooking
export type DeleteEvent = EventBooking

export const eventsRouter = router({
    createEvent: authenticatedProcedure
        .input((input: unknown) => input as CreateEvent)
        .mutation(async ({ input }) => {
            await createEvent(input)
        }),
    updateEvent: authenticatedProcedure
        .input((input: unknown) => input as UpdateEvent)
        .mutation(async ({ input }) => {
            await updateEvent(input)
        }),
    deleteEvent: authenticatedProcedure
        .input((input: unknown) => input as DeleteEvent)
        .mutation(async ({ input }) => {
            await deleteEvent(input)
        }),
})

export const events = onRequestTrpc(eventsRouter)
