import { getSquareLocationId, type AcuityConstants, type DiscountCode } from 'fizz-kidz'
import React, { useEffect } from 'react'

import { Form } from '../../pages/customer-booking-page'
import BookingSummary from './BookingSummary'
import DiscountInput from './DiscountInput'
import { useCart } from '../../state/cart-store'
import { styled } from '@mui/material/styles'
import { trpc } from '@utils/trpc'
import { DateTime } from 'luxon'
import { ApplePay, CreditCard, GooglePay, PaymentForm } from 'react-square-web-payments-sdk'
import { SQUARE_APPLICATION_ID } from '@constants/square'
import Loader from '@components/Shared/Loader'
import { Alert, AlertDescription, AlertTitle } from '@ui-components/alert'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

type Props = {
    appointmentTypeId: AcuityConstants.AppointmentTypeValue
    form: Form
    handleBookingSuccess: () => void
}

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

const Step3: React.FC<Props> = ({ appointmentTypeId, form, handleBookingSuccess }) => {
    // const total = useCart((store) => store.total)

    // const isFree = total === 0

    const selectedClasses = useCart((store) => store.selectedClasses)
    const selectedStudio = useCart((store) => store.selectedStudio)
    const total = useCart((store) => store.total)
    const subtotal = useCart((store) => store.subtotal)
    const discount = useCart((store) => store.discount)

    const squareLocationId = getSquareLocationId(selectedStudio!)

    const walletKey = `${discount?.code}-${discount?.discountAmount}-${discount?.discountType}` // force rerender the square checkout component when disconut code changes

    const { mutateAsync: book, isLoading, isSuccess, isError } = trpc.holidayPrograms.bookHolidayProgram.useMutation()

    function formatClassTime(date: string) {
        return DateTime.fromISO(date).toFormat('EEEE MMMM d, h:mm a')
    }

    function discountDescription(discount: DiscountCode) {
        if (discount.discountType === 'percentage') {
            return `Discount code '${discount.code}' - ${discount.discountAmount}% off`
        } else {
            return `Discount code '${discount.code}' - $${discount.discountAmount} off`
        }
    }

    useEffect(() => {
        if (isSuccess) {
            handleBookingSuccess()
        }
    }, [isSuccess, handleBookingSuccess])

    if (isSuccess) {
        return (
            <Alert variant="success" className="twp">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle className="font-semibold">Booked!</AlertTitle>
                <AlertDescription className="font-medium">
                    Your sessions have been booked, and you should have a booking confirmation email.
                    <br />
                    <br />
                    We can't wait to see you soon!
                </AlertDescription>
            </Alert>
        )
    }

    if (isLoading) {
        return (
            <div className="twp">
                <p className="mt-4 text-center">Processing payment...</p>
                <p className="mt-2 text-center">Please do not close or refresh this window.</p>
                <Loader className="my-4" />
            </div>
        )
    }

    return (
        <>
            <BookingSummary appointmentTypeId={appointmentTypeId} form={form} numberOfKids={form.children.length} />
            <DiscountInput numberOfKids={form.children.length} />
            <Root>
                <PaymentForm
                    key={walletKey}
                    applicationId={SQUARE_APPLICATION_ID}
                    locationId={squareLocationId}
                    cardTokenizeResponseReceived={async ({ status, token }, buyerVerification) => {
                        if (status === 'OK' && token) {
                            await book({
                                parentFirstName: form.parentFirstName,
                                parentLastName: form.parentLastName,
                                parentEmail: form.parentEmail,
                                parentPhone: form.phone,
                                emergencyContactName: form.emergencyContact,
                                emergencyContactPhone: form.emergencyPhone,
                                joinMailingList: true, // TODO
                                payment: {
                                    token: token,
                                    buyerVerificationToken: buyerVerification?.token || '',
                                    amount: total * 100, // cents
                                    locationId: squareLocationId,
                                    lineItems: Object.values(selectedClasses).flatMap((klass) =>
                                        form.children.map((child) => ({
                                            name: `${child.childName} - ${formatClassTime(klass.time)}`,
                                            amount: parseInt(klass.price) * 100, // cents
                                            quantity: '1',
                                            classId: klass.id,
                                            lineItemIdentifier: crypto.randomUUID(),
                                            appointmentTypeId: klass.appointmentTypeID,
                                            time: klass.time,
                                            calendarId: klass.calendarID,
                                            childName: child.childName,
                                            childDob: child.childAge.toISOString(),
                                            childAllergies: child.allergies || '',
                                            childAdditionalInfo: child.additionalInfo || '',
                                        }))
                                    ),
                                    discount: discount
                                        ? {
                                              ...discount,
                                              discountAmount:
                                                  discount.discountType === 'percentage'
                                                      ? discount.discountAmount
                                                      : discount.discountAmount * 100, // price discounts must be in cents
                                              description: discountDescription(discount),
                                          }
                                        : null,
                                },
                            })
                        } else {
                            toast.error('There was an error processing your payment')
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
                                label: `${child.childName} - ${formatClassTime(klass.time)}`,
                            }))
                        ),
                        discounts: discount
                            ? discount.discountType === 'percentage'
                                ? [
                                      {
                                          label: 'Discount',
                                          amount: (subtotal * (discount.discountAmount / 100)).toFixed(2),
                                      },
                                  ]
                                : [{ label: 'Discount', amount: discount.discountAmount.toFixed(2) }]
                            : undefined,
                        total: {
                            label: 'Total',
                            amount: total.toFixed(2),
                        },
                    })}
                >
                    {isError ? (
                        <Alert variant="destructive" className="twp my-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle className="font-semibold">Something went wrong</AlertTitle>
                            <AlertDescription className="font-medium">
                                {' '}
                                There was an error booking in your sessions. Please try again later or contact us at{' '}
                                <a href="mailto:bookings@fizzkidz.com.au" style={{ color: 'blue' }}>
                                    bookings@fizzkidz.com.au
                                </a>
                                .
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <>
                            <ApplePay style={{ marginTop: 32, marginBottom: 8 }} />
                            <GooglePay style={{ marginTop: 32, marginBottom: 8 }} />
                            <CreditCard
                                buttonProps={{
                                    css: {
                                        backgroundColor: '#AC4390',
                                        '&:hover': { backgroundColor: '#B4589C' },
                                        marginBottom: 16,
                                    },
                                }}
                            />
                        </>
                    )}
                </PaymentForm>
            </Root>
        </>
    )
}

export default Step3
