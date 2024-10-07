import type { Booking, GenerateInvitation, InvitationsV2, Studio } from 'fizz-kidz'

import { DatabaseClient } from '../../../firebase/DatabaseClient'
import { authenticatedProcedure, publicProcedure, router } from '../../../trpc/trpc'
import { createPartyBooking } from '../../core/create-party-booking'
import { deletePartyBooking } from '../../core/delete-party-booking'
import { generateInvitation } from '../../core/generate-invitation'
import { generateInvitationV2 } from '../../core/generate-invitation-v2'
import { updatePartyBooking } from '../../core/update-party-booking'
import { getPrefilledFormUrl } from '../../core/utils.party'

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
        .mutation(async ({ input }) => {
            const booking = await DatabaseClient.getPartyBooking(input.bookingId)
            return getPrefilledFormUrl(input.bookingId, booking)
        }),
    generateInvitation: publicProcedure
        .input((input: unknown) => input as GenerateInvitation)
        .mutation(({ input }) => generateInvitation(input)),
    generateInvitationV2: authenticatedProcedure
        .input((input: unknown) => input as InvitationsV2.GenerateInvitation)
        .mutation(({ input }) => generateInvitationV2(input)),
})
