import { Event, Service } from 'fizz-kidz'
import { useEffect, useState } from 'react'

import { convertTimestamps } from '../../../utilities/firebase/converters'
import { useDateNavigation } from '../DateNavigation/DateNavigation.hooks'
import useFirebase from '../../Hooks/context/UseFirebase'

export function useEvents() {
    const firebase = useFirebase()

    const { date } = useDateNavigation()
    const [events, setEvents] = useState<Service<Event[]>>({ status: 'loading' })

    useEffect(() => {
        async function fetchEvents() {
            // since we need to get a range between startDate and endDate,
            // and firestore does not support equality operators '>', '<' on multiple fields,
            // fetch all events that may have already started, and filter the rest on the frontend
            const nextDay = date.plus({ days: 1 })
            // an event will never be 90 days long, so a safe window
            const ninetyDaysAgo = date.minus({ days: 90 })

            const snap = await firebase.db
                .collectionGroup('eventSlots')
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
                // const deletedEvent = snap.docChanges().find((doc) => doc.type === 'removed')
                // if (deletedEvent) {
                //     console.log('FOUND DELETED EVENT!', deletedEvent.doc.data())
                // }
                setEvents({
                    status: 'loaded',
                    result: [
                        ...events,
                        // ...(deletedEvent ? [{ ...(convertTimestamps(deletedEvent.doc.data()) as Event) }] : []),
                    ],
                })
            } catch (error) {
                console.error(error)
                setEvents({ status: 'error', error })
            }
        }

        fetchEvents()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [date])

    return events
}
