import { Booking, Creation, Location } from 'fizz-kidz'
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

    // TO GET ALL PARTIES, JUST LOG `filteredBookings` NOW.
    // THE FOLLOWING CODE WAS USED TO GET END OF YEAR STATS FOR 2024.

    const total = filteredBookings.length
    const balwyn = filteredBookings.filter((it) => it.location === Location.BALWYN && it.type === 'studio')
    const cheltenam = filteredBookings.filter((it) => it.location === Location.CHELTENHAM && it.type === 'studio')
    const essendon = filteredBookings.filter((it) => it.location === Location.ESSENDON && it.type === 'studio')
    const malvern = filteredBookings.filter((it) => it.location === Location.MALVERN && it.type === 'studio')
    const mobile = filteredBookings.filter((it) => it.type === 'mobile')

    console.log('TOTAL BOOKINGS: ', total)
    console.log('Balwyn: ', balwyn.length)
    console.log('Cheltenham: ', cheltenam.length)
    console.log('Essendon: ', essendon.length)
    console.log('Malvern: ', malvern.length)
    console.log('Mobile: ', mobile.length)

    const creations: Partial<Record<Creation, number>> = {}

    filteredBookings.forEach((booking) => {
        if (booking.creation1) {
            const creation = booking.creation1
            if (creations[creation]) {
                creations[creation] += 1
            } else {
                creations[booking.creation1] = 1
            }
        }
        if (booking.creation2) {
            const creation = booking.creation2
            if (creations[creation]) {
                creations[creation] += 1
            } else {
                creations[booking.creation2] = 1
            }
        }
        if (booking.creation3) {
            const creation = booking.creation3
            if (creations[creation]) {
                creations[creation] += 1
            } else {
                creations[booking.creation3] = 1
            }
        }
    })

    console.log({ creations })

    const holSnap = await firestore.collectionGroup('programs').get()
    const programs = holSnap.docs.filter((it) => {
        const program = it.data()
        if (
            new Date(program.dateTime) > DateTime.fromObject({ year: 2024, month: 1, day: 1 }).toJSDate() &&
            new Date(program.dateTime) < DateTime.fromObject({ year: 2024, month: 12, day: 31 }).toJSDate()
        ) {
            return true
        }
        return false
    })

    console.log('Number of holiday program bookings: ', programs.length)

    const eventsSnap = await firestore.collectionGroup('eventSlots').get()
    const eventIds: Record<string, boolean> = {}
    let totalSlots = 0
    eventsSnap.docs.forEach((doc) => {
        const event = doc.data()
        const startTime = event.startTime.toDate() as Date
        if (startTime.getFullYear() === 2024) {
            eventIds[event.eventId] = true
            totalSlots++
        }
    })

    console.log('Total events: ', Object.keys(eventIds).length)
    console.log('Total event slots: ', totalSlots)
}
