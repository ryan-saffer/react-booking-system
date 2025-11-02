import type { FirestoreBooking, Service, Studio, WithId } from 'fizz-kidz'
import { STUDIOS } from 'fizz-kidz'
import { DateTime } from 'luxon'
import { useEffect, useRef, useState } from 'react'

import { useDateNavigation } from '@components/Bookings/date-navigation/date-navigation.hooks'
import useFirebase from '@components/Hooks/context/UseFirebase'
import { useOrg } from '@components/Session/use-org'

import { useLocationFilter } from '../location-filter/location-filter.hook'

export function usePartyBookings() {
    const firebase = useFirebase()

    const urlSearchParams = new URLSearchParams(window.location.search)
    const id = useRef(urlSearchParams.get('id'))

    const { currentOrg } = useOrg()

    const { filterByLocation } = useLocationFilter()

    const [bookings, setBookings] = useState<Service<Record<Studio, WithId<FirestoreBooking>[]>>>({
        status: 'loading',
    })

    const { date, setDate } = useDateNavigation()

    const generateLocationsMap = (bookings: WithId<FirestoreBooking>[]): Record<Studio, WithId<FirestoreBooking>[]> => {
        return STUDIOS.reduce(
            (acc, curr) => ({ ...acc, [curr]: bookings.filter((it) => it.location === curr) }),
            {} as any
        )
    }

    const runSubscription = useRef(true)

    useEffect(() => {
        if (!runSubscription.current) {
            runSubscription.current = true
            return
        }

        setBookings({ status: 'loading' })

        let unsubscribe = () => {}

        if (id.current) {
            unsubscribe = firebase.db
                .collection('bookings')
                .doc(id.current)
                .onSnapshot((snapshot) => {
                    if (!snapshot.exists) {
                        setBookings({
                            status: 'loaded',
                            result: generateLocationsMap([]),
                        })
                        return
                    }
                    const booking = snapshot.data() as FirestoreBooking
                    setDate(DateTime.fromJSDate(booking.dateTime.toDate()))
                    runSubscription.current = false // since we changed the date, this stops an infinite loop
                    id.current = null
                    setBookings({ status: 'loaded', result: generateLocationsMap([{ ...booking, id: snapshot.id }]) })
                    filterByLocation(booking.location)
                })
        } else {
            const followingDate = date.plus({ days: 1 })
            let query = firebase.db
                .collection('bookings')
                .where('dateTime', '>', date.toJSDate())
                .where('dateTime', '<', followingDate.toJSDate())

            if (currentOrg !== 'master') {
                query = query.where('location', '==', currentOrg)
            }

            unsubscribe = query.onSnapshot((snapshot) => {
                const bookings = snapshot.docs.map((doc) => ({
                    ...(doc.data() as FirestoreBooking),
                    id: doc.id,
                }))
                const deletedBooking = snapshot.docChanges().find((doc) => doc.type === 'removed')
                setBookings({
                    status: 'loaded',
                    result: generateLocationsMap([
                        ...bookings,
                        ...(deletedBooking
                            ? [{ ...(deletedBooking.doc.data() as FirestoreBooking), id: deletedBooking.doc.id }]
                            : []),
                    ]),
                })
            })
        }

        return () => unsubscribe()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [date, currentOrg])

    return bookings
}
