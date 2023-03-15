import React, { useContext, useRef, useState } from 'react'
import { Button, Typography } from 'antd'
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { Acuity, PaidHolidayProgramBooking } from 'fizz-kidz'
import { Form } from '..'
import Firebase, { FirebaseContext } from '../../../Firebase'
import { makeStyles } from '@material-ui/core'
import { DISCOUNT_PRICE, getSameDayClasses, PROGRAM_PRICE } from '../utilities'
import Loader from '../../../ScienceClub/shared/Loader'
import TermsCheckbox, { TermsCheckboxHandle } from './TermsCheckbox'

type Props = {
    form: Form
    selectedClasses: Acuity.Class[]
    paymentIntentId: string
    discount: Acuity.Certificate | undefined
}

const Payment: React.FC<Props> = ({ form, selectedClasses, paymentIntentId, discount }) => {
    const classes = useStyles()

    const stripe = useStripe()
    const elements = useElements()
    const firebase = useContext(FirebaseContext) as Firebase

    const termsRef = useRef<TermsCheckboxHandle>(null)
    const submitButtonRef = useRef<HTMLButtonElement>(null)

    const [paymentError, setPaymentError] = useState('')

    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async () => {
        setTimeout(() => submitButtonRef.current?.blur())

        if (!stripe || !elements) {
            // Stripe.js has not yet loaded.
            // Make sure to disable form submission until Stripe.js has loaded.
            return
        }

        if (!termsRef.current?.isChecked()) {
            termsRef.current?.showWarning()
            return
        }

        setPaymentError('')
        setSubmitting(true)

        // First write all the info needed to book into acuity into firestore, along with
        // the payment intent id, and a 'booked' status of false.
        //
        // A stripe webhook will listen to payment events, and will then search firestore
        // for this document, and if not booked, perform the acuity booking.
        //
        // This process ensures a class is not booked without paid, and vice versa,
        // and handles states such as failed payments gracefully.

        const discountedPrograms = getSameDayClasses(selectedClasses)

        const programs: PaidHolidayProgramBooking[] = selectedClasses.flatMap((klass) =>
            form.children.map((child) => ({
                appointmentTypeId:
                    process.env.REACT_APP_ENV === 'prod'
                        ? Acuity.Constants.AppointmentTypes.HOLIDAY_PROGRAM
                        : Acuity.Constants.AppointmentTypes.TEST_HOLIDAY_PROGRAM,
                dateTime: klass.time,
                calendarId: klass.calendarID,
                parentFirstName: form.parentFirstName,
                parentLastName: form.parentLastName,
                parentPhone: form.phone,
                parentEmail: form.parentEmail,
                emergencyContactName: form.emergencyContact,
                emergencyContactPhone: form.emergencyPhone,
                childName: child.childName,
                childAge: child.childAge,
                childAllergies: child.allergies ?? '',
                discountCode: discountedPrograms.includes(klass.id) ? 'allday' : '',
                amountCharged:
                    discount !== undefined
                        ? PROGRAM_PRICE
                        : discountedPrograms.includes(klass.id)
                        ? PROGRAM_PRICE - DISCOUNT_PRICE
                        : PROGRAM_PRICE,
                booked: false,
            }))
        )

        // check if payment intent already stored in database
        const query = await firebase.db.collection('holidayProgramBookings').doc(paymentIntentId).get()

        if (!query.exists) {
            let batch = firebase.db.batch()
            let paymentIntentRef = firebase.db.collection('holidayProgramBookings').doc(paymentIntentId)
            batch.set(paymentIntentRef, { booked: false })
            programs.forEach((program) => {
                let programRef = paymentIntentRef.collection('programs').doc()
                batch.set(programRef, { ...program })
            })
            try {
                await batch.commit()
            } catch {
                console.error('error writing to firestore')
                setSubmitting(false)
            }
        }

        const result = await stripe.confirmPayment({
            //`Elements` instance that was used to create the Payment Element
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/holiday-programs/confirmation`,
                receipt_email: form.parentEmail,
            },
        })

        if (result.error) {
            // Show error to your customer (for example, payment details incomplete)
            console.error(result.error.message)
            setPaymentError(result.error.message as string)
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
            <TermsCheckbox ref={termsRef} />
            {paymentError && (
                <Typography.Title type="danger" level={5} style={{ textAlign: 'center', marginTop: 12 }}>
                    {paymentError}
                </Typography.Title>
            )}
            <Button
                ref={submitButtonRef}
                className={classes.primaryButton}
                block
                type={submitting ? 'default' : 'primary'}
                size="large"
                onClick={handleSubmit}
                style={{ marginBottom: 12, marginTop: 16 }}
            >
                {submitting && <Loader size="sm" />}
                {!submitting && <strong>Confirm and pay</strong>}
            </Button>
        </>
    )
}

const useStyles = makeStyles({
    primaryButton: {
        background: 'linear-gradient(45deg, #f86ca7ff, #f4d444ff)',
        borderColor: 'white',
    },
})

export default Payment
