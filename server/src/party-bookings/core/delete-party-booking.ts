import { DatabaseClient } from '@/firebase/DatabaseClient'
import { CalendarClient } from '@/google/CalendarClient'
import { throwTrpcError } from '@/utilities'

import type { DeletePartyBooking } from '../functions/trpc/trpc.parties'
import { deleteInvitationV2 } from './rsvp/delete-invitation-v2'

export async function deletePartyBooking({ eventId, type, location, bookingId }: DeletePartyBooking) {
    const calendarClient = await CalendarClient.getInstance()

    try {
        await calendarClient.deleteEvent(eventId, { eventType: 'party-bookings', type, location })
    } catch (err) {
        throwTrpcError('INTERNAL_SERVER_ERROR', `error deleting party booking with id: '${bookingId}'`, err)
    }

    // if this party has an invitation, delete it
    const booking = await DatabaseClient.getPartyBooking(bookingId)
    if (booking.invitationId) {
        await deleteInvitationV2(booking.invitationId)
    }

    await DatabaseClient.deletePartyBooking(bookingId)
}
