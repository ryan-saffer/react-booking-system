import { FirestoreRefs } from '../../firebase/FirestoreRefs'

export async function getSelfCateredPartiesByNotes() {
    const snap = await (await FirestoreRefs.partyBookings()).where('dateTime', '>', new Date()).get()

    snap.docs.forEach((doc) => {
        const booking = doc.data()

        if (
            booking.notes.includes('self') ||
            booking.notes.includes('Self') ||
            booking.notes.includes('SELF') ||
            booking.notes.includes('Cater') ||
            booking.notes.includes('cater') ||
            booking.notes.includes('CATER')
        ) {
            console.log({ id: doc.id, notes: booking.notes })
        }
    })
}
