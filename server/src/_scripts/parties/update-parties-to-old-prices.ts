import { DatabaseClient } from '../../firebase/DatabaseClient'
import { FirestoreClient } from '../../firebase/FirestoreClient'
import { timestampConverter } from '../../firebase/firestore-converters'

/**
 * Update all bookings in firestore to set { oldPrices: true }
 */
export async function updatePartiesToOldPrices() {
    const firestore = await FirestoreClient.getInstance()
    const snap = await firestore.collection('bookings').withConverter(timestampConverter).get()

    const bookingIds = snap.docs.map((doc) => doc.id)

    console.log(`About to updating ${bookingIds.length} bookings to { oldPrices: true }`)

    await Promise.all(
        bookingIds.map((id) =>
            DatabaseClient.updatePartyBooking(id, {
                oldPrices: true,
            })
        )
    )
}
