import React, { useContext, useEffect, useState } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import Firebase, { FirebaseContext } from '../../Firebase'
import { callFirebaseFunction } from '../../../utilities/firebase/functions'
import Payment from './Payment'
import BookingSummary from './BookingSummary'
import { Acuity } from 'fizz-kidz'
import { Form, PROGRAM_PRICE } from '.'
import { FormInstance, Spin, Result } from 'antd'

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe('pk_test_zVaqwCZ8oI0LXs2CfbGFkZWn')

type Props = {
    form: Form
    formInstance: FormInstance
    selectedClasses: Acuity.Class[]
    selectedStore: string
}

const Step3: React.FC<Props> = ({ form, formInstance, selectedClasses, selectedStore }) => {
    const firebase = useContext(FirebaseContext) as Firebase
    const [paymentIntent, setPaymentIntent] = useState({
        id: '',
        clientSecret: '',
    })
    const [error, setError] = useState(false)

    const options = {
        // passing the client secret obtained from the server
        clientSecret: paymentIntent.clientSecret,
    }

    const totalPrice = selectedClasses.length * form.children.length * PROGRAM_PRICE * 100

    useEffect(() => {
        async function createPaymentIntent(amount: number) {
            try {
                let result = await callFirebaseFunction(
                    'createPaymentIntent',
                    firebase
                )({
                    name: `${form.parentFirstName} ${form.parentFirstName}`,
                    email: form.parentEmail,
                    phone: form.phone,
                    amount: amount,
                    description: `${selectedStore} store holiday program - ${form.parentFirstName} ${form.parentLastName}`,
                    program: 'holiday_program',
                })
                setPaymentIntent({
                    id: result.data.id,
                    clientSecret: result.data.clientSecret,
                })
            } catch {
                setError(true)
            }
        }
        createPaymentIntent(totalPrice)
    }, [])

    if (error) {
        return (
            <Result
                status="500"
                title="Oh no.."
                subTitle="Something went wrong. Please refresh the page to try again."
            />
        )
    }

    if (paymentIntent.clientSecret === '') {
        return (
            <Spin
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: 24,
                }}
            />
        )
    }

    return (
        <>
            <BookingSummary form={form} selectedClasses={selectedClasses} total={totalPrice} />
            <Elements stripe={stripePromise} options={options}>
                <Payment
                    form={form}
                    formInstance={formInstance}
                    selectedClasses={selectedClasses}
                    paymentIntentId={paymentIntent.id}
                />
            </Elements>
        </>
    )
}

export default Step3
