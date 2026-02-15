import type { Booking, GenerateInvitation, Studio } from 'fizz-kidz'

import { createPartyBooking } from '@/party-bookings/core/create-party-booking'
import { deletePartyBooking } from '@/party-bookings/core/delete-party-booking'
import { generateInvitation } from '@/party-bookings/core/generate-invitation'
import { updatePartyBooking } from '@/party-bookings/core/update-party-booking'
import { getPartyFormUrl, getCakeFormUrl } from '@/party-bookings/core/utils.party'
import { router, authenticatedProcedure, publicProcedure } from '@/trpc/trpc'

export type CreatePartyBooking = Booking
export type UpdatePartyBooking = { bookingId: string; booking: Booking }
export type DeletePartyBooking = { bookingId: string; eventId: string; location: Studio; type: Booking['type'] }

export const partiesRouter = router({
    createPartyBooking: authenticatedProcedure
        .input((input: unknown) => input as CreatePartyBooking)
        .mutation(({ input }) => createPartyBooking(input)),
    updatePartyBooking: authenticatedProcedure
        .input((input: unknown) => input as UpdatePartyBooking)
        .mutation(({ input }) => updatePartyBooking(input)),
    deletePartyBooking: authenticatedProcedure
        .input((input: unknown) => input as DeletePartyBooking)
        .mutation(({ input }) => deletePartyBooking(input)),
    getPartyFormUrl: authenticatedProcedure
        .input((input: unknown) => input as { bookingId: string })
        .mutation(({ input }) => getPartyFormUrl(input.bookingId)),
    getCakeFormUrl: authenticatedProcedure
        .input((input: unknown) => input as { bookingId: string })
        .mutation(({ input }) => getCakeFormUrl(input.bookingId)),
    generateInvitation: publicProcedure
        .input((input: unknown) => input as GenerateInvitation)
        .mutation(({ input }) => generateInvitation(input)),
})
