import { useEffect, useState } from 'react'
import useFirebase from '../../Hooks/context/UseFirebase'
import { Service, EventBooking } from 'fizz-kidz'
import { convertTimestamps } from '../../../utilities/firebase/converters'

export function useEvents(_date: Date = new Date()) {
    const firebase = useFirebase()

    const [date, setDate] = useState(_date)
    const [events, setEvents] = useState<Service<EventBooking[]>>({ status: 'loading' })

    useEffect(() => {
        async function fetchEvents() {
            // since we need to get a range between startDate and endDate,
            // and firestore does not support equality operators '>', '<' on multiple fields,
            // fetch all events that may have already started, and filter the rest on the frontend

            date.setHours(0, 0, 0, 0)
            const nextDay = new Date(date.getTime())
            nextDay.setDate(nextDay.getDate() + 1)
            // an event will never be 90 days long, so a safe window
            const ninetyDaysAgo = new Date(date.getTime())
            ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

            try {
                const snap = await firebase.db
                    .collection('events')
                    .where('startTime', '<', nextDay)
                    .where('startTime', '>', ninetyDaysAgo)
                    .get()

                const events = snap.docs
                    .map((doc) => {
                        const data = doc.data()
                        if (data) {
                            const event = convertTimestamps(data) as EventBooking
                            if (event.endTime > date) {
                                return event
                            }
                        }
                        return null
                    })
                    .filter((it): it is EventBooking => !!it)
                setEvents({ status: 'loaded', result: events })
            } catch (error) {
                console.error(error)
                setEvents({ status: 'error', error })
            }
        }

        fetchEvents()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [date])

    return [events, setDate] as const
}
