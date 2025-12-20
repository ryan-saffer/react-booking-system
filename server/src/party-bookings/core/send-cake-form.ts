import { DateTime } from 'luxon'

import { FirestoreRefs } from '@/firebase/FirestoreRefs'
import { midnight } from '@/utilities'

// runs daily
export async function sendCakeForms() {
    const startDate = midnight(DateTime.now().minus({ days: 7 }))
    const endDate = startDate.plus({ days: 1 })

    console.log({ startDate: startDate.toISO(), endDate: endDate.toISO() })

    const bookingsRef = await FirestoreRefs.partyBookings()
    const querySnapshot = await bookingsRef
        .where('createdAt', '>', startDate.toJSDate())
        .where('createdAt', '<', endDate.toJSDate())
        .get()

    querySnapshot.docs.forEach((doc) => console.log(doc.data()))
}
