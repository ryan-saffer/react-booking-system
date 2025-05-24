import { DatabaseClient } from '../../firebase/DatabaseClient'
import { CalendarClient } from '../../google/CalendarClient'
import { throwTrpcError } from '../../utilities'
import type { DeletePartyBooking } from '../functions/trpc/trpc.parties'

export async function deletePartyBooking({ eventId, type, location, bookingId }: DeletePartyBooking) {
    const calendarClient = await CalendarClient.getInstance()

    try {
        await calendarClient.deleteEvent(eventId, { eventType: 'party-bookings', type, location })
    } catch (err) {
        throwTrpcError('INTERNAL_SERVER_ERROR', `error deleting party booking with id: '${bookingId}'`, err)
    }
    await DatabaseClient.deletePartyBooking(bookingId)
}
