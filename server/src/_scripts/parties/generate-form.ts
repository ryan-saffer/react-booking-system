import { getPrefilledFormUrl } from '../../party-bookings/core/utils'
import { DatabaseClient } from '../../firebase/DatabaseClient'

export async function generatePartyFormUrl(bookingId: string) {
    const booking = await DatabaseClient.getPartyBooking(bookingId)

    const formUrl = getPrefilledFormUrl(bookingId, booking)

    console.log('Party form url:')
    console.log(formUrl)
}
