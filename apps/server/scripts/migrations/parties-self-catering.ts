import { DatabaseClient } from '@/integrations/firebase/database.client'
import { FirestoreRefs } from '@/integrations/firebase/firestore.refs'

export async function addFoodPackageToAllParties() {
    const snap = await (await FirestoreRefs.partyBookings()).get()

    await Promise.all(
        snap.docs.map((doc) => {
            const booking = doc.data()
            return DatabaseClient.updatePartyBooking(doc.id, { includesFood: booking.type === 'studio' })
        })
    )
}
