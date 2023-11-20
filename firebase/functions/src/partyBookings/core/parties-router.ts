import { Booking, Location } from 'fizz-kidz'
import { authenticatedProcedure, router } from '../../trpc/trpc'
import { createPartyBooking } from './create-party-booking'
import { updatePartyBooking } from './update-party-booking'
import { deletePartyBooking } from './delete-party-booking'

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
