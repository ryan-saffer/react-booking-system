import { DatabaseClient } from '../../firebase/DatabaseClient'
import { CalendarClient } from '../../google/CalendarClient'
import { logError, throwError } from '../../utilities'
import { DeletePartyBooking } from './parties-router'

export async function deletePartyBooking({ eventId, type, location, bookingId }: DeletePartyBooking) {
    const calendarClient = await CalendarClient.getInstance()

    try {
        await calendarClient.deleteEvent(eventId, { eventType: 'party-bookings', type, location })
    } catch (err) {
        logError(`error deleting party booking with id: '${bookingId}'`, err)
        throwError('internal', `error deleting party booking with id: '${bookingId}'`, err)
    }
    await DatabaseClient.deletePartyBooking(bookingId)
}
