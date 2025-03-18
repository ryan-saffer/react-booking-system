import { Button, Checkbox, Typography } from 'antd'
import { AcuityConstants, AcuityTypes, DiscountCode, PaidHolidayProgramBooking } from 'fizz-kidz'
import React, { useContext, useRef, useState } from 'react'

import Firebase, { FirebaseContext } from '@components/Firebase'
import Loader from '@components/Shared/Loader'
import { styled } from '@mui/material/styles'
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'

import { PRICE_MAP, getSameDayClasses } from '../utilities'
import { TermsCheckbox, TermsCheckboxHandle } from './TermsCheckbox'
import { Form } from '..'

const PREFIX = 'Payment'

const classes = {
    primaryButton: `${PREFIX}-primaryButton`,
}

const Root = styled('div')({
    [`& .${classes.primaryButton}`]: {
        background: 'linear-gradient(45deg, #f86ca7ff, #f4d444ff)',
        borderColor: 'white',
    },
})

type Props = {
    appointmentTypeId: AcuityConstants.AppointmentTypeValue
    form: Form
    selectedClasses: AcuityTypes.Api.Class[]
    paymentIntentId: string
    discount: DiscountCode | undefined
}

const Payment: React.FC<Props> = ({ appointmentTypeId, form, selectedClasses, paymentIntentId, discount }) => {
    const stripe = useStripe()
    const elements = useElements()
    const firebase = useContext(FirebaseContext) as Firebase

    const termsRef = useRef<TermsCheckboxHandle>(null)
    const submitButtonRef = useRef<HTMLButtonElement>(null)

    const [joinMailingList, setJoinMailingList] = useState(true)
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
                appointmentTypeId,
                dateTime: klass.time,
                calendarId: klass.calendarID,
                parentFirstName: form.parentFirstName,
                parentLastName: form.parentLastName,
                parentPhone: form.phone,
                parentEmail: form.parentEmail,
                emergencyContactName: form.emergencyContact,
                emergencyContactPhone: form.emergencyPhone,
                childName: child.childName,
                childAge: child.childAge.toISOString(),
                childAllergies: child.allergies ?? '',
                childAdditionalInfo: child.additionalInfo || '',
                discountCode: discount?.code || (discountedPrograms.includes(klass.id) ? 'allday' : ''),
                amountCharged:
                    discount !== undefined
                        ? PRICE_MAP[appointmentTypeId].PROGRAM_PRICE
                        : discountedPrograms.includes(klass.id)
                          ? PRICE_MAP[appointmentTypeId].PROGRAM_PRICE - PRICE_MAP[appointmentTypeId].DISCOUNT_PRICE
                          : PRICE_MAP[appointmentTypeId].PROGRAM_PRICE,
                booked: false,
                joinMailingList,
            }))
        )

        // check if payment intent already stored in database
        const query = await firebase.db.collection('holidayProgramBookings').doc(paymentIntentId).get()

        if (!query.exists) {
            const batch = firebase.db.batch()
            console.log('creating doc')
            const paymentIntentRef = firebase.db.collection('holidayProgramBookings').doc(paymentIntentId)
            console.log('doc created!')
            batch.set(paymentIntentRef, { booked: false })
            programs.forEach((program) => {
                const programRef = paymentIntentRef.collection('programs').doc()
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
                return_url: `${window.location.origin}/programs/confirmation`,
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
        <Root>
            <PaymentElement />
            {paymentError && (
                <Typography.Title type="danger" level={5} style={{ textAlign: 'center', marginTop: 12 }}>
                    {paymentError}
                </Typography.Title>
            )}
            <Checkbox className="mt-4" onChange={(e) => setJoinMailingList(e.target.checked)} checked={joinMailingList}>
                Keep me informed about the latest Fizz Kidz programs and offers.
            </Checkbox>
            <TermsCheckbox
                ref={termsRef}
                showCancellationPolicy={appointmentTypeId !== AcuityConstants.AppointmentTypes.KINGSVILLE_OPENING}
            />
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
        </Root>
    )
}

export default Payment
