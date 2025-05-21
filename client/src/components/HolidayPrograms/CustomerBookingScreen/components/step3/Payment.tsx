import { Checkbox } from 'antd'
import { AcuityConstants, getSquareLocationId } from 'fizz-kidz'
import { DateTime } from 'luxon'
import React, { useRef, useState } from 'react'
import { ApplePay, CreditCard, GooglePay, PaymentForm } from 'react-square-web-payments-sdk'

import { SQUARE_APPLICATION_ID } from '@constants/square'
import { styled } from '@mui/material/styles'

import { Form } from '../../pages/customer-booking-page'
import { useCart } from '../../state/cart-store'
import { TermsCheckbox, TermsCheckboxHandle } from './TermsCheckbox'

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
}

const Payment: React.FC<Props> = ({ appointmentTypeId, form }) => {
    const selectedClasses = useCart((store) => store.selectedClasses)
    const selectedStudio = useCart((store) => store.selectedStudio)
    const total = useCart((store) => store.total)
    const subtotal = useCart((store) => store.subtotal)
    const discount = useCart((store) => store.discount)

    const termsRef = useRef<TermsCheckboxHandle>(null)

    const [joinMailingList, setJoinMailingList] = useState(true)

    const squareLocationId = getSquareLocationId(selectedStudio!)

    const walletKey = `${discount?.code}-${discount?.discountAmount}-${discount?.discountType}` // force rerender the square checkout component when disconut code changes

    return (
        <Root>
            <PaymentForm
                key={walletKey}
                applicationId={SQUARE_APPLICATION_ID}
                locationId={squareLocationId}
                cardTokenizeResponseReceived={({ status, token }) => {
                    if (status === 'OK' && token) {
                        // TODO - book holiday program
                    } else {
                        // TODO - show error processing payment
                    }
                }}
                createVerificationDetails={() => ({
                    amount: total.toFixed(2),
                    billingContact: {
                        givenName: form.parentFirstName,
                        familyName: form.parentLastName,
                        email: form.parentEmail,
                        phone: form.phone,
                    },
                    currencyCode: 'AUD',
                    intent: 'CHARGE',
                })}
                createPaymentRequest={() => ({
                    countryCode: 'AU',
                    currencyCode: 'AUD',
                    lineItems: Object.values(selectedClasses).flatMap((klass) =>
                        form.children.map((child) => ({
                            amount: klass.price,
                            label: `${child.childName} - ${DateTime.fromISO(klass.time).toFormat('EEEE MMMM d, h:mm a')}`,
                        }))
                    ),
                    discounts: discount
                        ? discount.discountType === 'percentage'
                            ? [{ label: 'Discount', amount: (subtotal * (discount.discountAmount / 100)).toFixed(2) }]
                            : [{ label: 'Discount', amount: discount.discountAmount.toFixed(2) }]
                        : undefined,
                    total: {
                        label: 'Total',
                        amount: total.toFixed(2),
                    },
                })}
            >
                <Checkbox
                    className="mt-4"
                    onChange={(e) => setJoinMailingList(e.target.checked)}
                    checked={joinMailingList}
                >
                    Keep me informed about the latest Fizz Kidz programs and offers.
                </Checkbox>
                <TermsCheckbox
                    ref={termsRef}
                    showCancellationPolicy={appointmentTypeId !== AcuityConstants.AppointmentTypes.KINGSVILLE_OPENING}
                />
                {/* TODO - render error here instead of payment buttons */}
                <ApplePay />
                <GooglePay />
                <CreditCard
                    buttonProps={{
                        css: { backgroundColor: '#AC4390', '&:hover': { backgroundColor: '#B4589C' } },
                    }}
                />
            </PaymentForm>
        </Root>
    )
}

export default Payment
