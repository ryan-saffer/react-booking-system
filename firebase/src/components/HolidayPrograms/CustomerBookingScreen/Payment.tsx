import React from 'react'
import { Button, FormInstance } from 'antd'
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { Form } from '.'

type Props = {
    form: Form
    formInstance: FormInstance
}

const Payment: React.FC<Props> = () => {
    const stripe = useStripe()
    const elements = useElements()

    const handleSubmit = async () => {
        if (!stripe || !elements) {
            // Stripe.js has not yet loaded.
            // Make sure to disable form submission until Stripe.js has loaded.
            return
        }

        const result = await stripe.confirmPayment({
            //`Elements` instance that was used to create the Payment Element
            elements,
            confirmParams: {
                return_url: 'https://example.com/order/123/complete',
            },
        })

        if (result.error) {
            // Show error to your customer (for example, payment details incomplete)
            console.log(result.error.message)
        } else {
            // Your customer will be redirected to your `return_url`. For some payment
            // methods like iDEAL, your customer will be redirected to an intermediate
            // site first to authorize the payment, then redirected to the `return_url`.
        }
    }

    return (
        <>
            <PaymentElement />
            <Button
                block
                type="primary"
                size='large'
                onClick={handleSubmit}
                style={{ marginBottom: 12, marginTop: 16 }}
            >
                <strong>Confirm and pay</strong>
            </Button>
        </>
    )
}

export default Payment
