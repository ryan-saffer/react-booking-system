import { getSquareLocationId } from 'fizz-kidz'
import { AlertCircle, PartyPopper, XIcon } from 'lucide-react'
import { DateTime } from 'luxon'
import { useEffect, useRef } from 'react'
import { ApplePay, CreditCard, GooglePay, PaymentForm } from 'react-square-web-payments-sdk'
import { toast } from 'sonner'

import Loader from '@components/Shared/Loader'
import { SQUARE_APPLICATION_ID } from '@constants/square'
import { Alert, AlertDescription, AlertTitle } from '@ui-components/alert'
import { Button } from '@ui-components/button'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@ui-components/table'
import { trpc } from '@utils/trpc'

import { useCart, type LocalAcuityClass } from '../../../state/cart-store'
import { useBookingForm } from '../../../state/form-schema'
import { useFormStage } from '../../../state/form-stage-store'
import { DiscountInput } from './discount-input'

export function Payment() {
    //#region Variables
    const form = useBookingForm()
    const formStage = useFormStage((store) => store.formStage)
    const nextStage = useFormStage((store) => store.nextStage)
    const { selectedClasses, discount, subtotal, total, removeDiscount } = useCart()

    const children = form.watch('children')
    const studio = form.watch('studio')

    const squareLocationId = studio ? getSquareLocationId(studio) : ''

    const walletKey = `${discount?.description}-${discount?.amount}-${discount?.type}` // force rerender the square checkout component when disconut code changes

    const idempotencyKey = useRef(crypto.randomUUID())

    const { mutateAsync, isLoading, isError, error, reset } = trpc.playLab.book.useMutation()
    //#endregion

    //#region Effects
    useEffect(() => {
        if (formStage !== 'payment') {
            reset()
        }
    }, [formStage, reset])
    //#endregion

    //#region Methods
    function formatClassTime(date: Date) {
        return DateTime.fromJSDate(date).toFormat('EEEE MMMM d, h:mm a')
    }

    async function book(token: string, buyerVerificationToken: string) {
        if (isError) {
            idempotencyKey.current = crypto.randomUUID()
        }
        await mutateAsync({
            idempotencyKey: idempotencyKey.current,
            bookingType: form.getValues().bookingType!,
            classes: Object.values(selectedClasses).map((klass) => {
                const { name } = JSON.parse(klass.description)
                return {
                    ...klass,
                    name,
                    time: DateTime.fromJSDate(klass.time, { zone: 'Australia/Melbourne' }).toISO(),
                }
            }),
            parentFirstName: form.getValues().parentFirstName,
            parentLastName: form.getValues().parentLastName,
            parentPhone: form.getValues().parentPhone,
            parentEmail: form.getValues().parentEmailAddress,
            emergencyContactName: form.getValues().emergencyContactName,
            emergencyContactPhone: form.getValues().emergencyContactNumber,
            emergencyContactRelation: form.getValues().emergencyContactRelation,
            children: form.getValues().children.map((child) => ({ ...child, dob: child.dob.toISOString() })),
            joinMailingList: form.getValues().joinMailingList,
            reference: form.getValues().reference,
            referenceOther: form.getValues().referenceOther,
            payment: {
                token,
                buyerVerificationToken,
                locationId: squareLocationId,
                amount: Math.round(total * 100), // cents
                lineItems: Object.values(selectedClasses).flatMap((klass) => {
                    const { name } = JSON.parse(klass.description)
                    return children.map((child) => ({
                        name: `${child.firstName} - ${name} - ${formatClassTime(klass.time)}`,
                        amount: Math.round(parseInt(klass.price) * 100),
                        quantity: '1',
                        classId: klass.id,
                        lineItemIdentifier: crypto.randomUUID(),
                        appointmentTypeID: klass.appointmentTypeID,
                        className: name,
                        time: klass.time.toISOString(),
                        duration: klass.duration,
                        calendarID: klass.calendarID,
                        childFirstName: child.firstName,
                        childLastName: child.lastName,
                        childDob: child.dob.toISOString(),
                        childAllergies: child.allergies || '',
                        childAdditionalInfo: child.additionalInfo || '',
                        emergencyContactName: form.getValues().emergencyContactName,
                        emergencyContactPhone: form.getValues().emergencyContactNumber,
                        emergencyContactRelation: form.getValues().emergencyContactRelation,
                    }))
                }),
                discount: discount
                    ? {
                          ...discount,
                          amount: discount.type === 'percentage' ? discount.amount : discount.amount * 100, // 'price' discounts must be in cents
                          name: discount.description,
                      }
                    : null,
            },
        })
        nextStage()
    }

    function renderPriceCell(klass: LocalAcuityClass) {
        if (discount?.isMultiSessionDiscount) {
            return (
                <div className="flex flex-col justify-end gap-2 sm:flex-row">
                    <span className="line-through">${parseFloat(klass.price).toFixed(2)}</span>
                    <span>${(parseFloat(klass.price) - discount.sessionDiscountAmount).toFixed(2)}</span>
                </div>
            )
        } else {
            return <span>${parseFloat(klass.price).toFixed(2)}</span>
        }
    }

    function renderError() {
        if (isError) {
            let errorMessage =
                'There was an error booking in your sessions. Please try again later or contact us at bookings@fizzkidz.com.au'
            let errorTitle = 'Something went wrong'

            if (error.data?.code === 'CLASS_FULL') {
                errorMessage =
                    "One or more of your selected sessions does not have enough spots available. Please return to the 'Select Sessions' screen and review your selected sessions."
                errorTitle = 'One or more sessions are full'
            }

            if (error.data?.code === 'PAYMENT_METHOD_INVALID') {
                errorTitle = 'Payment Failed'
                errorMessage =
                    'Unfortunately we were unable to process your payment. Please check your payment method and try again.'
            }

            return (
                <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle className="font-semibold">{errorTitle}</AlertTitle>
                    <AlertDescription className="font-medium">{errorMessage}</AlertDescription>
                </Alert>
            )
        }

        return null
    }
    //#endregion

    //#region Rendering
    if (formStage !== 'payment') return null

    if (isLoading) {
        return (
            <>
                <p className="mt-4 text-center">Processing payment...</p>
                <p className="mt-2 text-center">Please do not close or refresh this window.</p>
                <Loader className="mt-4" />
            </>
        )
    }

    return (
        <>
            <p className="my-2 text-center text-xl font-bold">Booking Summary</p>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Program</TableHead>
                        <TableHead>Child</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Object.values(selectedClasses)
                        .sort((a, b) => (a.time > b.time ? 1 : -1))
                        .map((klass) => {
                            const { name } = JSON.parse(klass.description)
                            return children.map((child, idx) => (
                                <TableRow key={`${klass.id}-${idx}`}>
                                    <TableCell>
                                        <span className="font-bold">{formatClassTime(klass.time)}</span>
                                        <br />
                                        {name}
                                    </TableCell>
                                    <TableCell>{child.firstName}</TableCell>
                                    <TableCell className="text-right">{renderPriceCell(klass)}</TableCell>
                                </TableRow>
                            ))
                        })}
                </TableBody>
                <TableFooter>
                    {discount && (
                        <>
                            <TableRow>
                                <TableCell colSpan={2} className="py-2 font-light italic">
                                    Subtotal
                                </TableCell>
                                <TableCell className="py-2 text-right font-light italic">
                                    ${subtotal.toFixed(2)}
                                </TableCell>
                            </TableRow>
                            <TableRow className="bg-green-200 hover:bg-green-200/80">
                                <TableCell colSpan={2} className="py-2 font-light italic text-green-800">
                                    <div className="flex items-center">
                                        <PartyPopper className="mr-2 h-5 w-5" />
                                        {discount.description}
                                        {!discount.isMultiSessionDiscount && (
                                            <Button
                                                className="ml-2 min-h-0 border border-transparent p-1 hover:border-green-800  hover:bg-green-200/80"
                                                variant="ghost"
                                                onClick={() =>
                                                    removeDiscount(
                                                        form.getValues().children.length,
                                                        form.getValues().bookingType === 'term-booking'
                                                    )
                                                }
                                            >
                                                <XIcon className="size-4" />
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="py-2 text-right font-light italic text-green-800">
                                    {discount.type === 'percentage'
                                        ? `${discount.amount}% off`
                                        : `$${discount.amount} off`}
                                </TableCell>
                            </TableRow>
                        </>
                    )}
                    <TableRow className="border-t">
                        <TableCell colSpan={2}>Total</TableCell>
                        <TableCell className="pt-2 text-right">${total.toFixed(2)}</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
            <DiscountInput />
            <PaymentForm
                key={walletKey}
                applicationId={SQUARE_APPLICATION_ID}
                locationId={squareLocationId}
                cardTokenizeResponseReceived={({ status, token }, buyerVerification) => {
                    if (status === 'OK' && token && !isLoading) {
                        book(token, buyerVerification?.token || '')
                    } else {
                        toast.error('There was an error processing your payment')
                    }
                }}
                createVerificationDetails={() => ({
                    amount: total.toFixed(2),
                    billingContact: {
                        givenName: form.getValues().parentFirstName,
                        familyName: form.getValues().parentLastName,
                        email: form.getValues().parentEmailAddress,
                        phone: form.getValues().parentPhone,
                    },
                    currencyCode: 'AUD',
                    intent: 'CHARGE',
                })}
                createPaymentRequest={() => ({
                    countryCode: 'AU',
                    currencyCode: 'AUD',
                    lineItems: Object.values(selectedClasses).flatMap((klass) => {
                        const { name } = JSON.parse(klass.description)
                        return children.map((child) => ({
                            amount: klass.price,
                            label: `${child.firstName} - ${name} - ${formatClassTime(klass.time)}`,
                        }))
                    }),
                    discounts: discount
                        ? discount.type === 'percentage'
                            ? [{ label: 'Discount', amount: (subtotal * (discount.amount / 100)).toFixed(2) }]
                            : [{ label: 'Discount', amount: discount.amount.toFixed(2) }]
                        : undefined,
                    total: {
                        amount: total.toFixed(2),
                        label: 'Total',
                    },
                })}
            >
                {isError ? (
                    renderError()
                ) : (
                    <div className="mt-8">
                        <ApplePay className="mb-4" />
                        <GooglePay className="mb-4" />
                        <CreditCard
                            buttonProps={{
                                css: { backgroundColor: '#AC4390', '&:hover': { backgroundColor: '#B4589C' } },
                            }}
                        />
                    </div>
                )}
            </PaymentForm>
        </>
    )
    //#endregion
}
