import React, { useContext, useEffect, useState } from 'react'
import { Result, Spin } from 'antd'
import useQueryParam from '../../../Hooks/UseQueryParam'
import Root from '../../../Shared/Root'
import Firebase, { FirebaseContext } from '../../../Firebase'

type Props = {}

const Confirmation: React.FC<Props> = () => {
    const firebase = useContext(FirebaseContext) as Firebase
    const paymentIntentId = useQueryParam('payment_intent') as string

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        // a timeout to wait for the firestore document to be updated to 'booked'
        let timeout = setTimeout(() => {
            setError(true)
            setLoading(false)
        }, 10000)

        const observer = firebase.db
            .collection('holidayProgramBookings')
            .doc(paymentIntentId)
            .onSnapshot(
                (snapshot) => {

                    if (!snapshot.exists) {
                        setError(true)
                        setLoading(false)
                        return
                    }

                    let booked = snapshot.get('booked')
                    // on first snapshot read, this will be false (booking process still ongoing),
                    // and hence no 'else' statement to set the error.
                    // if however a second snapshot doesn't happen, the timeout above sets the error
                    if (booked) {
                        clearTimeout(timeout)
                        setLoading(false)
                        return
                    }
                },
                () => {
                    setError(true)
                    setLoading(false)
                }
            )
        return function unsubscribe() {
            observer()
        }
    }, [])

    if (loading) {
        return (
            <Root color='pink' width='centered'>
                <Spin style={{ marginTop: 36, marginBottom: 12 }}/>
            </Root>
        )
    }

    if (error) {
        return (
            <Root color='pink' width='centered'>
                <Result
                    status="500"
                    title="Something went wrong"
                    subTitle="Please email us at bookings@fizzkidz.com.au to ensure your spot is confirmed."
                />
            </Root>
        )
    }
    return (
        <Root color='pink' width='centered'>
            <Result
                status="success"
                title="Booking confirmed"
                subTitle="We've sent you a confirmation email where you can manage your booking. We can't wait to see you there!"
            />
        </Root>
    )
}

export default Confirmation
