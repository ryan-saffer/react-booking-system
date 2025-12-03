import type { Booking, GenerateInvitation, InvitationsV2, Studio, WithoutId, WithoutUid } from 'fizz-kidz'
import { z } from 'zod'

import { DatabaseClient } from '@/firebase/DatabaseClient'
import { createPartyBooking } from '@/party-bookings/core/create-party-booking'
import { deletePartyBooking } from '@/party-bookings/core/delete-party-booking'
import { generateInvitation } from '@/party-bookings/core/generate-invitation'
import { editInvitation } from '@/party-bookings/core/rsvp/edit-invitation-v2'
import { generateInvitationUrl } from '@/party-bookings/core/rsvp/generate-invitation-url'
import { generateInvitationV2 } from '@/party-bookings/core/rsvp/generate-invitation-v2'
import { linkInvitation } from '@/party-bookings/core/rsvp/link-invitation-v2'
import { resetInvitation } from '@/party-bookings/core/rsvp/reset-invitation-v2'
import { rsvpToParty } from '@/party-bookings/core/rsvp/rsvp-to-party-v2'
import type { RsvpProps } from '@/party-bookings/core/rsvp/rsvp-to-party-v2'
import { updatePartyBooking } from '@/party-bookings/core/update-party-booking'
import { getPrefilledFormUrl } from '@/party-bookings/core/utils.party'
import { authenticatedProcedure, publicProcedure, router } from '@/trpc/trpc'

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
    generateInvitationUrl: authenticatedProcedure
        .input(z.object({ bookingId: z.string() }))
        .mutation(({ input }) => generateInvitationUrl(input.bookingId)),
    generateInvitationV2: publicProcedure
        .input((input: unknown) => input as WithoutId<WithoutUid<InvitationsV2.Invitation>>)
        .mutation(({ input }) => generateInvitationV2(input)),
    linkInvitation: authenticatedProcedure
        .input((input: unknown) => input as WithoutUid<InvitationsV2.Invitation>)
        .mutation(({ input, ctx }) => linkInvitation({ ...input, uid: ctx.uid })),
    editInvitation: authenticatedProcedure
        .input((input: unknown) => input as InvitationsV2.Invitation)
        .mutation(({ input }) => editInvitation(input)),
    resetInvitation: authenticatedProcedure
        .input((input: unknown) => input as { invitationId: string })
        .mutation(({ input }) => resetInvitation(input.invitationId)),
    rsvp: publicProcedure
        .input((input: unknown) => input as WithoutId<RsvpProps>)
        .mutation(({ input }) => rsvpToParty(input)),
})
