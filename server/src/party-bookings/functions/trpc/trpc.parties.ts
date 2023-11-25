import { Booking, Location } from 'fizz-kidz'
import { authenticatedProcedure, router } from '../../../trpc/trpc'

import { createPartyBooking } from '../../core/create-party-booking'
import { deletePartyBooking } from '../../core/delete-party-booking'
import { onRequestTrpc } from '../../../trpc/trpc.adapter'
import { updatePartyBooking } from '../../core/update-party-booking'

export type CreatePartyBooking = Booking
export type UpdatePartyBooking = { bookingId: string; booking: Booking }
export type DeletePartyBooking = { bookingId: string; eventId: string; location: Location; type: Booking['type'] }

export const partiesRouter = router({
    createPartyBooking: authenticatedProcedure
        .input((input: unknown) => input as CreatePartyBooking)
        .mutation(async ({ input }) => {
            await createPartyBooking(input)
        }),
    updatePartyBooking: authenticatedProcedure
        .input((input: unknown) => input as UpdatePartyBooking)
        .mutation(async ({ input }) => {
            await updatePartyBooking(input)
        }),
    deletePartyBooking: authenticatedProcedure
        .input((input: unknown) => input as DeletePartyBooking)
        .mutation(async ({ input }) => {
            await deletePartyBooking(input)
        }),
})

export const parties = onRequestTrpc(partiesRouter)
