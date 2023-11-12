import { FirestoreBooking, WithId, Location } from 'fizz-kidz'
import { useEffect, useRef, useState } from 'react'
import useFirebase from '../Hooks/context/UseFirebase'
import { useDateNavigation } from '@components/Bookings/DateNavigation/DateNavigation.hooks'
import { DateTime } from 'luxon'

export function usePartyBookings({
    setSelectedLocations,
}: {
    setSelectedLocations: (locations: { [key in Location]?: boolean }) => void
    setEventsChecked: (checked: boolean) => void
    id?: string
}) {
    const firebase = useFirebase()

    const urlSearchParams = new URLSearchParams(window.location.search)
    const id = useRef(urlSearchParams.get('id'))

    const [bookings, setBookings] = useState<WithId<FirestoreBooking>[]>([])

    const { date, setDate, setLoading } = useDateNavigation()

    const runSubscription = useRef(true)

    useEffect(() => {
        if (!runSubscription.current) {
            runSubscription.current = true
            return
        }

        setLoading(true)

        let unsubscribe = () => {}

        if (id.current) {
            unsubscribe = firebase.db
                .collection('bookings')
                .doc(id.current)
                .onSnapshot((snapshot) => {
                    if (!snapshot.exists) {
                        setBookings([bookings[0] ?? []])
                        setLoading(false)
                        return
                    }
                    const booking = snapshot.data() as FirestoreBooking
                    setDate(DateTime.fromJSDate(booking.dateTime.toDate()))
                    runSubscription.current = false // since we changed the date, this stops an infinite loop
                    id.current = null
                    setBookings([{ ...booking, id: snapshot.id }])
                    setSelectedLocations(
                        Object.values(Location).reduce(
                            (acc, curr) => ({ ...acc, [curr]: booking.location === curr }),
                            {}
                        )
                    )
                    setLoading(false)
                })
        } else {
            const followingDate = date.plus({ days: 1 })
            unsubscribe = firebase.db
                .collection('bookings')
                .where('dateTime', '>', date.toJSDate())
                .where('dateTime', '<', followingDate.toJSDate())
                .onSnapshot((snapshot) => {
                    const bookings = snapshot.docs.map((doc) => ({
                        ...(doc.data() as FirestoreBooking),
                        id: doc.id,
                    }))
                    const deletedBooking = snapshot.docChanges().find((doc) => doc.type === 'removed')
                    setBookings([
                        ...bookings,
                        ...(deletedBooking
                            ? [{ ...(deletedBooking.doc.data() as FirestoreBooking), id: deletedBooking.doc.id }]
                            : []),
                    ])
                    setLoading(false)
                })
        }

        return () => unsubscribe()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [date])

    return bookings
}
