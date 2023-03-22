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
            date.setHours(0, 0, 0, 0)
            var nextDay = new Date(date.getTime())
            nextDay.setDate(nextDay.getDate() + 1)

            try {
                const snap = await firebase.db
                    .collection('events')
                    .where('startTime', '>', date)
                    .where('startTime', '<', nextDay)
                    .get()

                const events = snap.docs
                    .map((doc) => {
                        const data = doc.data()
                        if (data) {
                            return convertTimestamps(data)
                        }
                        return null
                    })
                    .filter((it): it is EventBooking => !!it)

                setEvents({ status: 'loaded', result: events })
            } catch (error) {
                setEvents({ status: 'error', error })
            }
        }

        fetchEvents()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [date])

    return [events, setDate] as const
}
