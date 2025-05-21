import { Result } from 'antd'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import useFirebase from '@components/Hooks/context/UseFirebase'
import Loader from '@components/Shared/Loader'
import Root from '@components/Shared/Root'

export const Confirmation = () => {
    const firebase = useFirebase()

    const [searchParams] = useSearchParams()
    const paymentIntentId = searchParams.get('payment_intent') ?? undefined
    const isFree = searchParams.get('free')

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        // a timeout to wait for the firestore document to be updated to 'booked'
        const timeout = setTimeout(() => {
            setError(true)
            setLoading(false)
        }, 15000)

        if (isFree) {
            setLoading(false)
            clearTimeout(timeout)
            return
        }

        const unsubscribe = firebase.db
            .collection('holidayProgramBookings')
            .doc(paymentIntentId)
            .onSnapshot(
                (snapshot) => {
                    if (!snapshot.exists) {
                        setError(true)
                        setLoading(false)
                        return
                    }

                    const booked = snapshot.get('booked')
                    // on first snapshot read, this will be false (booking process still ongoing),
                    // and hence no 'else' statement to set the error.
                    // if however a second snapshot doesn't happen, the timeout above sets the error
                    if (booked) {
                        clearTimeout(timeout)
                        setLoading(false)
                        setError(false)
                        return
                    }
                },
                () => {
                    setError(true)
                    setLoading(false)
                }
            )
        return () => {
            unsubscribe()
            clearTimeout(timeout)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (loading) {
        return (
            <Root width="centered" useTailwindPreflight={false}>
                <Loader style={{ marginTop: 36, marginBottom: 12 }} />
            </Root>
        )
    }

    if (error) {
        return (
            <Root width="centered" useTailwindPreflight={false}>
                <Result
                    status="500"
                    title="Something went wrong"
                    subTitle="Please email us at bookings@fizzkidz.com.au to ensure your spot is confirmed."
                />
            </Root>
        )
    }
    return (
        <Root width="centered" useTailwindPreflight={false}>
            <Result
                status="success"
                title="Booking confirmed"
                subTitle="We've sent you a confirmation email where you can manage your booking. We can't wait to see you there!"
            />
        </Root>
    )
}
