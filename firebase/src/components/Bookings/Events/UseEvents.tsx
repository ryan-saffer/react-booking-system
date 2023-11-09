import { useEffect, useState } from 'react'
import useFirebase from '../../Hooks/context/UseFirebase'
import { Service, EventBooking } from 'fizz-kidz'
import { convertTimestamps } from '../../../utilities/firebase/converters'
import { useDateNavigation } from '../DateNavigation/DateNavigation'

export function useEvents() {
    const firebase = useFirebase()

    const { date } = useDateNavigation()
    const [events, setEvents] = useState<Service<EventBooking[]>>({ status: 'loading' })

    useEffect(() => {
        async function fetchEvents() {
            // since we need to get a range between startDate and endDate,
            // and firestore does not support equality operators '>', '<' on multiple fields,
            // fetch all events that may have already started, and filter the rest on the frontend
            const nextDay = date.plus({ days: 1 })
            // an event will never be 90 days long, so a safe window
            const ninetyDaysAgo = date.minus({ days: 90 })

            try {
                const snap = await firebase.db
                    .collection('events')
                    .where('startTime', '<', nextDay.toJSDate())
                    .where('startTime', '>', ninetyDaysAgo.toJSDate())
                    .get()

                const events = snap.docs
                    .map((doc) => {
                        const data = doc.data()
                        if (data) {
                            const event = convertTimestamps(data) as EventBooking
                            if (event.endTime > date.toJSDate()) {
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

    return events
}
