import { FirestoreClient } from '../../firebase/FirestoreClient'
import { onCall } from '../../utilities'

export const bookEvent = onCall<'bookEvent'>(async (booking, _context) => {
    const { id: eventId } = await FirestoreClient.createEventBooking(booking)

    return eventId
})
