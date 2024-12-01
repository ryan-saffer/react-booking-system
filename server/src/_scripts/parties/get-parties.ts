import { Booking, Location } from 'fizz-kidz'
import { DateTime } from 'luxon'

import { FirestoreClient } from '../../firebase/FirestoreClient'
import { timestampConverter } from '../../firebase/firestore-converters'

/**
 * Get all party bookings between from and to.
 *
 * @param from defaults to today
 * @param to defaults to in 10 years
 */
export async function getParties({
    from = new Date(),
    to,
    location,
    type,
}: {
    from?: Date
    to?: Date
    location?: Location
    type?: 'studio' | 'mobile'
}) {
    const firestore = await FirestoreClient.getInstance()

    const snap = await firestore
        .collection('bookings')
        .where('dateTime', '>=', from)
        .where('dateTime', '<=', to ?? DateTime.fromJSDate(from).plus({ years: 10 }).toJSDate())
        .withConverter(timestampConverter)
        .get()

    const bookings = snap.docs.map((doc) => doc.data() as Booking)
    const filteredBookings =
        location || type
            ? bookings.filter((it) => {
                  if (location && type) {
                      return it.location === location && it.type === type
                  }
                  if (location) {
                      return it.location === location
                  }
                  if (type) {
                      return it.type === type
                  }
              })
            : bookings

    filteredBookings.forEach((booking) => console.log(booking))
}
