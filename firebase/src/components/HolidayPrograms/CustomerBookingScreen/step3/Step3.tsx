import { Result } from 'antd'
import type { AcuityTypes } from 'fizz-kidz'
import { DateTime } from 'luxon'
import React, { useContext, useEffect, useMemo, useState } from 'react'

import Firebase, { FirebaseContext } from '@components/Firebase'
import Loader from '@components/ScienceClub/shared/Loader'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { callFirebaseFunction } from '@utils/firebase/functions'
import { capitalise } from '@utils/stringUtilities'

import { DISCOUNT_PRICE, PROGRAM_PRICE, calculateTotal, getSameDayClasses } from '../utilities'
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
    form: Form
    selectedClasses: AcuityTypes.Api.Class[]
    selectedStore: string
}

const Step3: React.FC<Props> = ({ form, selectedClasses, selectedStore }) => {
    const firebase = useContext(FirebaseContext) as Firebase
    const [paymentIntent, setPaymentIntent] = useState({
        id: '',
        clientSecret: '',
    })
    const [error, setError] = useState(false)
    const [discount, setDiscount] = useState<AcuityTypes.Api.Certificate | undefined>(undefined)

    const options = {
        // passing the client secret obtained from the server
        clientSecret: paymentIntent.clientSecret,
    }

    const discountedClasses = useMemo(() => getSameDayClasses(selectedClasses), [selectedClasses])
    const { totalPrice, originalTotal } = useMemo(
        () => calculateTotal(selectedClasses, discountedClasses, form.children.length, discount),
        [selectedClasses, discountedClasses, discount, form.children]
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
            amount: discount?.certificate
                ? PROGRAM_PRICE
                : item.discounted
                ? PROGRAM_PRICE - DISCOUNT_PRICE
                : PROGRAM_PRICE,
        }))

    useEffect(() => {
        async function createPaymentIntent(amount: number) {
            try {
                const result = await callFirebaseFunction(
                    'createPaymentIntent',
                    firebase
                )({
                    name: `${form.parentFirstName} ${form.parentLastName}`,
                    email: form.parentEmail,
                    phone: form.phone,
                    amount: amount * 100,
                    description: `${capitalise(selectedStore)} Store Holiday Program - ${form.parentFirstName} ${
                        form.parentLastName
                    }`,
                    programType: 'holiday_program',
                    programs: createPriceMap(),
                    discount: discount,
                })
                setPaymentIntent({
                    id: result.data.id,
                    clientSecret: result.data.clientSecret,
                })
            } catch {
                setError(true)
            }
        }
        createPaymentIntent(totalPrice)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        async function updatePaymentIntent() {
            try {
                if (paymentIntent.id !== '') {
                    await callFirebaseFunction(
                        'updatePaymentIntent',
                        firebase
                    )({
                        id: paymentIntent.id,
                        amount: totalPrice * 100,
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
                summarisedItems={summarisedList}
                total={totalPrice}
                originalTotal={originalTotal !== totalPrice ? originalTotal : undefined}
                discount={discount}
                setDiscount={setDiscount}
            />
            <DiscountInput email={form.parentEmail} setDiscount={setDiscount} total={originalTotal} />
            {!isFree && (
                <Elements stripe={stripePromise} options={options}>
                    <Payment
                        form={form}
                        selectedClasses={selectedClasses}
                        paymentIntentId={paymentIntent.id}
                        discount={discount}
                    />
                </Elements>
            )}
            {isFree && discount?.certificate && (
                <FreeConfirmationButton
                    form={form}
                    selectedClasses={selectedClasses}
                    discountCode={discount?.certificate}
                    setError={setError}
                />
            )}
        </>
    )
}

export default Step3
