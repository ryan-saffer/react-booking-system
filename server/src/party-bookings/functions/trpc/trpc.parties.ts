import type { Booking, GenerateInvitation, InvitationsV2, Studio, WithoutId, WithoutUid } from 'fizz-kidz'

import { DatabaseClient } from '../../../firebase/DatabaseClient'
import { authenticatedProcedure, publicProcedure, router } from '../../../trpc/trpc'
import { createPartyBooking } from '../../core/create-party-booking'
import { deletePartyBooking } from '../../core/delete-party-booking'
import { generateInvitation } from '../../core/generate-invitation'
import { generateInvitationV2 } from '../../core/generate-invitation-v2'
import { linkInvitation } from '../../core/link-invitation-v2'
import { RsvpProps, rsvpToParty } from '../../core/rsvp-to-party-v2'
import { updatePartyBooking } from '../../core/update-party-booking'
import { getPrefilledFormUrl } from '../../core/utils.party'
import { editInvitation } from '../../core/edit-invitation-v2'

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
    generateInvitationV2: publicProcedure
        .input((input: unknown) => input as WithoutId<WithoutUid<InvitationsV2.Invitation>>)
        .mutation(({ input }) => generateInvitationV2(input)),
    linkInvitation: authenticatedProcedure
        .input((input: unknown) => input as WithoutUid<InvitationsV2.Invitation>)
        .mutation(({ input, ctx }) => linkInvitation({ ...input, uid: ctx.uid })),
    editInvitation: authenticatedProcedure
        .input((input: unknown) => input as InvitationsV2.Invitation)
        .mutation(({ input }) => editInvitation(input)),
    rsvp: publicProcedure
        .input((input: unknown) => input as WithoutId<RsvpProps>)
        .mutation(({ input }) => rsvpToParty(input)),
})
