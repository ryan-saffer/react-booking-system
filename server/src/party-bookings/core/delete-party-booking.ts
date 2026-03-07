import { DatabaseClient } from '@/firebase/DatabaseClient'
import { CalendarClient } from '@/google/CalendarClient'
import { logError, throwTrpcError } from '@/utilities'
import { ZohoClient } from '@/zoho/zoho-client'

import type { DeletePartyBooking } from '../functions/trpc/trpc.parties'

export async function deletePartyBooking(props: DeletePartyBooking) {
    const { eventId, type, location, bookingId } = props
    const calendarClient = await CalendarClient.getInstance()

    try {
        await calendarClient.deleteEvent(eventId, { eventType: 'party-bookings', type, location })
    } catch (err) {
        throwTrpcError('INTERNAL_SERVER_ERROR', `error deleting party booking with id: '${bookingId}'`, err)
    }

    const existingBooking = await DatabaseClient.getPartyBooking(bookingId)
    if (existingBooking.zohoDealId) {
        try {
            const zohoClient = new ZohoClient()
            await zohoClient.markPartyDealClosedLost(existingBooking.zohoDealId)
        } catch (err) {
            logError('Error marking party booking as closed lost while deleting', err, props)
        }
    }

    await DatabaseClient.deletePartyBooking(bookingId)
}
