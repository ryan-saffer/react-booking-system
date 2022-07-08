import React, { useContext, useState } from 'react'
import { Button, Checkbox, FormInstance, Modal, Spin, Typography } from 'antd'
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { Acuity } from 'fizz-kidz'
import { Form } from '.'
import Firebase, { FirebaseContext } from '../../Firebase'
import { callAcuityClientV2 } from '../../../utilities/firebase/functions'

type Props = {
    form: Form
    formInstance: FormInstance
    selectedClasses: Acuity.Class[]
}

const Payment: React.FC<Props> = ({ form, selectedClasses }) => {
    const stripe = useStripe()
    const elements = useElements()
    const firebase = useContext(FirebaseContext) as Firebase

    const [termsChecked, setTermsChecked] = useState(false)
    const [showTermsWarning, setShowTermsWarning] = useState(false)
    const [showTermsModal, setShowTermsModal] = useState(false)

    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (!stripe || !elements) {
            // Stripe.js has not yet loaded.
            // Make sure to disable form submission until Stripe.js has loaded.
            return
        }

        if (!termsChecked) {
            setShowTermsWarning(true)
            return
        }

        setSubmitting(true)

        let programs: Acuity.Client.HolidayProgramBooking[] = []
        selectedClasses.forEach((klass) => {
            form.children.forEach((child) => {
                programs.push({
                    appointmentTypeId:
                        process.env.REACT_APP_ENV === 'prod'
                            ? Acuity.Constants.AppointmentTypes.HOLIDAY_PROGRAM
                            : Acuity.Constants.AppointmentTypes
                                  .TEST_HOLIDAY_PROGRAM,
                    dateTime: klass.time,
                    parentFirstName: form.parentFirstName,
                    parentLastName: form.parentLastName,
                    parentPhone: form.phone,
                    parentEmail: form.parentEmail,
                    emergencyContactName: form.emergencyContact,
                    emergencyContactPhone: form.emergencyPhone,
                    childName: child.childName,
                    childAge: child.childAge,
                    childAllergies: child.allergies,
                })
            })
        })

        // first book into acuity
        let acuityResult = await callAcuityClientV2(
            'scheduleHolidayProgram',
            firebase
        )(programs)

        if (!acuityResult) {
            console.error('error booking into acuity')
            setSubmitting(false)
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
            console.error(result.error.message)
            setSubmitting(false)
        } else {
            // Your customer will be redirected to your `return_url`. For some payment
            // methods like iDEAL, your customer will be redirected to an intermediate
            // site first to authorize the payment, then redirected to the `return_url`.
        }
    }

    return (
        <>
            <PaymentElement />
            <div style={{ display: 'flex', marginTop: 16 }}>
                <Checkbox
                    checked={termsChecked}
                    onChange={(e) => {
                        setTermsChecked(e.target.checked)
                        setShowTermsWarning(false)
                    }}
                >
                    I have read and agreed to the{' '}
                    <Typography.Link onClick={() => setShowTermsModal(true)}>
                        Terms and Conditions
                    </Typography.Link>
                </Checkbox>
            </div>
            {showTermsWarning && (
                <Typography.Text type="danger">
                    Please accept the terms and conditions
                </Typography.Text>
            )}
            <Button
                block
                type={submitting ? 'default' : 'primary'}
                size="large"
                onClick={handleSubmit}
                style={{ marginBottom: 12, marginTop: 16 }}
            >
                {submitting && <Spin />}
                {!submitting && <strong>Confirm and pay</strong>}
            </Button>
            <Modal
                title="Terms and conditions"
                visible={showTermsModal}
                footer={[
                    <Button
                        type="primary"
                        onClick={() => setShowTermsModal(false)}
                    >
                        Ok
                    </Button>,
                ]}
            >
                Terms and conditions go here!
            </Modal>
        </>
    )
}

export default Payment
