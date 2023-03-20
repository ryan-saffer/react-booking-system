import { FirestoreClient } from '../../firebase/FirestoreClient'
import { onCall } from '../../utilities'

export const bookEvent = onCall<'bookEvent'>(async (booking) => {
    // parse date strings back to date objects
    booking.startTime = new Date(booking.startTime)
    booking.endTime = new Date(booking.endTime)

    const id = await FirestoreClient.createEventBooking(booking)

    return id
})
