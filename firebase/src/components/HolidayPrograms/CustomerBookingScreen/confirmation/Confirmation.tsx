import React, { useContext, useEffect, useState } from 'react'
import { Result, Spin } from 'antd'
import useQueryParam from '../../../Hooks/UseQueryParam'
import Root from '../Root'
import Firebase, { FirebaseContext } from '../../../Firebase'

type Props = {}

const Confirmation: React.FC<Props> = () => {
    const firebase = useContext(FirebaseContext) as Firebase
    const paymentIntentId = useQueryParam('payment_intent') as string

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        async function fetchBookedStatus() {
            const query = await firebase.db.collection('holidayProgramBookings').doc(paymentIntentId).get()
            if (!query.exists) {
                setError(true)
            } else {
                let status = query.get('booked') as boolean
                if (!status) {
                    setError(true)
                }
            }
            setLoading(false)
        }
        fetchBookedStatus()
    }, [])

    if (loading) {
        return (
            <Root>
                <Spin />
            </Root>
        )
    }

    if (error) {
        return (
            <Root>
                <Result
                    status="500"
                    title="Something went wrong"
                    subTitle="Please email us at bookings@fizzkidz.com.au to ensure your spot is confirmed."
                />
            </Root>
        )
    }
    return (
        <Root>
            <Result
                status="success"
                title="Booking confirmed"
                subTitle="We've sent you a confirmation email where you can manage your booking. We can't wait to see you there!"
            />
        </Root>
    )
}

export default Confirmation
