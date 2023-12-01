import { Event, Service } from 'fizz-kidz'
import { useEffect, useState } from 'react'

import { convertTimestamps } from '@utils/firebase/converters'

import useFirebase from '../../Hooks/context/UseFirebase'
import { useDateNavigation } from '../date-navigation/date-navigation.hooks'

export function useEvents(type: Event['type']) {
    const firebase = useFirebase()

    const { date, setLoading } = useDateNavigation()
    const [events, setEvents] = useState<Service<Event[]>>({ status: 'loading' })

    useEffect(() => {
        async function fetchEvents() {
            setLoading(true)
            // since we need to get a range between startDate and endDate,
            // and firestore does not support equality operators '>', '<' on multiple fields,
            // fetch all events that may have already started, and filter the rest on the frontend
            const nextDay = date.plus({ days: 1 })
            // an event will never be 90 days long, so a safe window
            const ninetyDaysAgo = date.minus({ days: 90 })

            const snap = await firebase.db
                .collectionGroup('eventSlots')
                .where('type', '==', type)
                .where('startTime', '<', nextDay.toJSDate())
                .where('startTime', '>', ninetyDaysAgo.toJSDate())
                .get()

            try {
                const events = snap.docs
                    .map((doc) => {
                        const data = doc.data()
                        if (data) {
                            const event = convertTimestamps(data) as Event
                            if (event.endTime > date.toJSDate()) {
                                return event
                            }
                        }
                        return null
                    })
                    .filter((it): it is Event => !!it)
                setEvents({
                    status: 'loaded',
                    result: [...events],
                })
            } catch (error) {
                console.error(error)
                setEvents({ status: 'error', error })
            } finally {
                setLoading(false)
            }
        }

        fetchEvents()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [date])

    return events
}
