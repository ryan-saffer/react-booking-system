import React, { useContext, useEffect, useState } from 'react'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import Firebase, { FirebaseContext } from '../../Firebase'
import { callFirebaseFunction } from '../../../utilities/firebase/functions'
import Payment from './Payment'
import BookingSummary from './BookingSummary'
import { Acuity } from 'fizz-kidz'
import { Form, PROGRAM_PRICE } from '.'
import { FormInstance, Spin } from 'antd'

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe('pk_test_zVaqwCZ8oI0LXs2CfbGFkZWn')

type Props = {
    form: Form
    formInstance: FormInstance
    selectedClasses: Acuity.Class[]
}

const Step3: React.FC<Props> = ({ form, formInstance, selectedClasses }) => {
    const firebase = useContext(FirebaseContext) as Firebase
    const [clientSecret, setClientSecret] = useState('')

    const options = {
        // passing the client secret obtained from the server
        clientSecret: clientSecret,
    }

    const totalPrice = selectedClasses.length * form.children.length * PROGRAM_PRICE * 100

    useEffect(() => {
        async function createPaymentIntent(amount: number) {
            let result = await callFirebaseFunction(
                'createPaymentIntent',
                firebase
            )({
                amount: amount,
                description: `${form.store} store holiday program - ${form.parentFirstName} ${form.parentLastName}`,
            })
            console.log(result)
            setClientSecret(result.data)
        }
        createPaymentIntent(totalPrice)
    }, [])

    if (clientSecret === '') {
        return <Spin style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }} />
    }

    return (
        <>
            <BookingSummary
                form={form}
                selectedClasses={selectedClasses}
                total={totalPrice}
            />
            <Elements stripe={stripePromise} options={options}>
                <Payment form={form} formInstance={formInstance} />
            </Elements>
        </>
    )
}

export default Step3
