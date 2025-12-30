import { getPartyFormUrl } from '../../party-bookings/core/utils.party'

export async function generatePartyFormUrl(bookingId: string) {
    const formUrl = getPartyFormUrl(bookingId)

    console.log('Party form url:')
    console.log(formUrl)
}
