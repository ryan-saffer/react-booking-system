import type { Booking } from 'fizz-kidz'
import type { Studio } from 'fizz-kidz'
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
    studio,
    type,
}: {
    from?: Date
    to?: Date
    studio?: Studio
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
        studio || type
            ? bookings.filter((it) => {
                  if (studio && type) {
                      return it.location === studio && it.type === type
                  }
                  if (studio) {
                      return it.location === studio
                  }
                  if (type) {
                      return it.type === type
                  }
              })
            : bookings

    return filteredBookings
}
