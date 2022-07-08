import React, { useContext, useEffect, useState } from 'react'
import { Button, FormInstance } from 'antd'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import Firebase, { FirebaseContext } from '../../Firebase'
import { callFirebaseFunction } from '../../../utilities/firebase/functions'
import Payment from './Payment'

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe('pk_test_zVaqwCZ8oI0LXs2CfbGFkZWn')

type Props = {
    form: FormInstance
}

const Step3: React.FC<Props> = ({ form }) => {
    const firebase = useContext(FirebaseContext) as Firebase
    const [clientSecret, setClientSecret] = useState('')

    const options = {
        // passing the client secret obtained from the server
        clientSecret: clientSecret,
    }

    useEffect(() => {
        async function createPaymentIntent(amount: number) {
            let result = await callFirebaseFunction(
                'createPaymentIntent',
                firebase
            )({
                amount: amount,
            })
            console.log(result)
            setClientSecret(result.data)
        }
        console.log(form.getFieldValue('phone'))
        createPaymentIntent(100)
    }, [])

    

    if (clientSecret === '') {
        return <div>Loading...</div>
    }

    return (
        <Elements stripe={stripePromise} options={options}>
            <Payment />
        </Elements>
    )
}

export default Step3
