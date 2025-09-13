import type { Event, IncursionEvent, Service, StandardEvent } from 'fizz-kidz'
import { Location } from 'fizz-kidz'
import { useEffect, useState } from 'react'

import { useOrg } from '@components/Session/use-org'
import { convertTimestamps } from '@utils/firebase/converters'

import useFirebase from '../../Hooks/context/UseFirebase'
import { useDateNavigation } from '../date-navigation/date-navigation.hooks'

export function useEvents<T extends Event['$type']>(
    type: T
): Service<Record<Location, T extends 'standard' ? StandardEvent[] : IncursionEvent[]>> {
    const firebase = useFirebase()

    const { date } = useDateNavigation()
    const [events, setEvents] = useState<Service<Record<Location, Event[]>>>({ status: 'loading' })

    const { currentOrg } = useOrg()

    const generateLocationsMap = (events: Event[]): Record<Location, Event[]> =>
        Object.values(Location).reduce(
            (acc, curr) => ({ ...acc, [curr]: events.filter((it) => it.studio === curr) }),
            {} as any
        )

    useEffect(() => {
        async function fetchEvents() {
            setEvents({ status: 'loading' })
            // since we need to get a range between startDate and endDate,
            // and firestore does not support equality operators '>', '<' on multiple fields,
            // fetch all events that may have already started, and filter the rest on the frontend
            const nextDay = date.plus({ days: 1 })
            // an event will never be 90 days long, so a safe window
            const ninetyDaysAgo = date.minus({ days: 90 })

            let query = firebase.db
                .collectionGroup('eventSlots')
                .where('$type', '==', type)
                .where('startTime', '<', nextDay.toJSDate())
                .where('startTime', '>', ninetyDaysAgo.toJSDate())

            if (currentOrg !== 'master') {
                query = query.where('studio', '==', currentOrg)
            }

            const snap = await query.get()

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
                    result: generateLocationsMap(events),
                })
            } catch (error) {
                console.error(error)
                setEvents({ status: 'error', error })
            }
        }

        fetchEvents()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [date])

    return events as any
}
