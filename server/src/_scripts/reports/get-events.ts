import type { Event, Studio } from 'fizz-kidz'
import { DateTime } from 'luxon'

import { FirestoreClient } from '@/firebase/FirestoreClient'
import { timestampConverter } from '@/firebase/firestore-converters'

export async function getEvents({ from = new Date(), to, studio }: { from?: Date; to?: Date; studio?: Studio }) {
    const firestore = await FirestoreClient.getInstance()

    const snap = await firestore
        .collectionGroup('eventSlots')
        .where('startTime', '>=', from)
        .where('endTime', '<=', to ?? DateTime.fromJSDate(from).plus({ years: 10 }).toJSDate())
        .withConverter(timestampConverter)
        .get()

    const bookings = snap.docs.map((doc) => doc.data() as Event)
    const filteredBookings = studio ? bookings.filter((it) => it.studio === studio) : bookings
    return filteredBookings
}
