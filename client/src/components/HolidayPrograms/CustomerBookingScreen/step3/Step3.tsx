import { Result } from 'antd'
import { capitalise, type AcuityConstants, type AcuityTypes, type DiscountCode } from 'fizz-kidz'
import { DateTime } from 'luxon'
import React, { useEffect, useMemo, useRef, useState } from 'react'

import Loader from '@components/Shared/Loader'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { trpc } from '@utils/trpc'

import { PRICE_MAP, calculateTotal, getProgramName, getProgramType, getSameDayClasses } from '../utilities'
import BookingSummary from './BookingSummary'
import DiscountInput from './DiscountInput'
import FreeConfirmationButton from './FreeConfirmationButton'
import Payment from './Payment'
import { Form } from '..'

const isProd = import.meta.env.VITE_ENV === 'prod'

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(
    (isProd ? import.meta.env.VITE_STRIPE_API_KEY_PROD : import.meta.env.VITE_STRIPE_API_KEY_TEST) as string
)

export type ItemSummary = { childName: string; dateTime: string; discounted: boolean }
type ChildForm = { childName: string }

type Props = {
    appointmentTypeId: AcuityConstants.AppointmentTypeValue
    form: Form
    selectedClasses: AcuityTypes.Api.Class[]
    selectedStore: string
}

const Step3: React.FC<Props> = ({ appointmentTypeId, form, selectedClasses, selectedStore }) => {
    const [paymentIntent, setPaymentIntent] = useState({
        id: '',
        clientSecret: '',
    })
    const [error, setError] = useState(false)
    const [discount, setDiscount] = useState<DiscountCode | undefined>(undefined)

    const createPaymentIntentMutation = trpc.stripe.createPaymentIntent.useMutation()
    const updatePaymentIntentMutation = trpc.stripe.updatePaymentIntent.useMutation()

    const options = {
        // passing the client secret obtained from the server
        clientSecret: paymentIntent.clientSecret,
    }

    const discountedClasses = useMemo(() => getSameDayClasses(selectedClasses), [selectedClasses])
    const { totalPrice, originalTotal } = useMemo(
        () => calculateTotal(appointmentTypeId, selectedClasses, discountedClasses, form.children.length, discount),
        [selectedClasses, discountedClasses, discount, form.children, appointmentTypeId]
    )
    const isFree = totalPrice === 0

    const summarisedList: ItemSummary[] = []
    const sortedSelectedClasses = selectedClasses.map((it) => it)
    sortedSelectedClasses.sort((a, b) => (a.time < b.time ? -1 : a.time > b.time ? 1 : 0))
    sortedSelectedClasses.forEach((klass) => {
        form['children'].forEach((child: ChildForm) => {
            const dateTime = DateTime.fromISO(klass.time).toLocaleString({
                weekday: 'short',
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            })
            summarisedList.push({
                childName: child.childName,
                dateTime: dateTime,
                discounted: discountedClasses.includes(klass.id),
            })
        })
    })

    const createPriceMap = () =>
        summarisedList.map((item) => ({
            childName: item.childName,
            dateTime: item.dateTime,
            // if using a discount code, all individual prices are the full amount
            // if not using a discount code, set according to if each individual item is discounted (ie same day)
            amount: discount?.code
                ? PRICE_MAP[appointmentTypeId].PROGRAM_PRICE
                : item.discounted
                  ? PRICE_MAP[appointmentTypeId].PROGRAM_PRICE - PRICE_MAP[appointmentTypeId].DISCOUNT_PRICE
                  : PRICE_MAP[appointmentTypeId].PROGRAM_PRICE,
        }))

    // this ref is needed because in strict mode, createPaymentIntent runs twice
    // useful when testing locally to ensure it runs once.
    const creatingPaymentIntentRef = useRef(false)
    useEffect(() => {
        async function createPaymentIntent(amount: number) {
            try {
                const result = await createPaymentIntentMutation.mutateAsync({
                    name: `${form.parentFirstName} ${form.parentLastName}`,
                    email: form.parentEmail,
                    phone: form.phone,
                    amount: amount * 100,
                    description: getProgramName(
                        appointmentTypeId,
                        capitalise(selectedStore),
                        form.parentFirstName,
                        form.parentLastName
                    ),
                    programType: getProgramType(appointmentTypeId),
                    programs: createPriceMap(),
                    discount: discount,
                })
                setPaymentIntent({
                    id: result.id,
                    clientSecret: result.clientSecret,
                })
            } catch {
                setError(true)
            }
        }
        if (!creatingPaymentIntentRef.current) {
            creatingPaymentIntentRef.current = true
            createPaymentIntent(totalPrice)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        async function updatePaymentIntent() {
            try {
                if (paymentIntent.id !== '') {
                    await updatePaymentIntentMutation.mutateAsync({
                        id: paymentIntent.id,
                        amount: Math.floor(totalPrice * 100),
                        programs: createPriceMap(),
                        discount: discount,
                    })
                }
            } catch (error) {
                setError(true)
            }
        }

        if (isFree) {
            return
        }
        updatePaymentIntent()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [discount])

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
            <Loader
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
            <BookingSummary
                appointmentTypeId={appointmentTypeId}
                summarisedItems={summarisedList}
                total={totalPrice}
                originalTotal={originalTotal !== totalPrice ? originalTotal : undefined}
                discount={discount}
                setDiscount={setDiscount}
            />
            <DiscountInput setDiscount={setDiscount} total={originalTotal} />
            {!isFree && (
                <Elements stripe={stripePromise} options={options}>
                    <Payment
                        appointmentTypeId={appointmentTypeId}
                        form={form}
                        selectedClasses={selectedClasses}
                        paymentIntentId={paymentIntent.id}
                        discount={discount}
                    />
                </Elements>
            )}
            {isFree && discount?.code && (
                <FreeConfirmationButton
                    appointmentTypeId={appointmentTypeId}
                    form={form}
                    selectedClasses={selectedClasses}
                    discountCode={discount?.code}
                    setError={setError}
                />
            )}
        </>
    )
}

export default Step3
