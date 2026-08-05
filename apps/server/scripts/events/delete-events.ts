import { DatabaseClient } from '@/integrations/firebase/database.client'
import { FirestoreClient } from '@/integrations/firebase/firestore.client'

export async function deleteEvents(email: string) {
    const firestore = await FirestoreClient.getInstance()

    const eventSlots = await firestore.collectionGroup('eventSlots').where('contactEmail', '==', email).get()

    for (let i = 0; i < eventSlots.docs.length; i++) {
        const doc = eventSlots.docs[i]
        const data = doc.data()
        await DatabaseClient.deleteEventBooking(data.eventId, data.id)
    }
}
