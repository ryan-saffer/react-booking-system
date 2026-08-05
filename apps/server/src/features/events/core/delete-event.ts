import type { Event } from '@fizz-kidz/core'

import { throwTrpcError } from '@/app/trpc/transport-errors'
import { DatabaseClient } from '@/integrations/firebase/database.client'
import { CalendarClient } from '@/integrations/google/calendar.client'
import { ZohoClient } from '@/integrations/zoho/zoho.client'

export async function deleteEvent(event: Event) {
    try {
        const slots = await DatabaseClient.getEventSlots<'standard' | 'incursion'>(event.eventId)
        const isLastSlot = slots.length === 1

        if (event.zohoDealId) {
            await new ZohoClient().deleteB2BEventSession({
                dealId: event.zohoDealId,
                startTime: new Date(event.startTime),
                remainingSessionCount: Math.max(0, slots.length - 1),
                isLastSlot,
            })
        }

        const calendarClient = await CalendarClient.getInstance()
        await calendarClient.deleteEvent(event.calendarEventId, { eventType: 'events' })
        await DatabaseClient.deleteEventBooking(event.eventId, event.id)
    } catch (err) {
        throwTrpcError('INTERNAL_SERVER_ERROR', 'There was an error deleting the event', err)
    }
}
